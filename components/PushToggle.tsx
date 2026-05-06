"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  subscribePush,
  unsubscribePush,
  sendTestNotif,
} from "@/lib/actions/push";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type State =
  | "checking"
  | "unsupported"
  | "denied"
  | "subscribed"
  | "unsubscribed"
  | "no-vapid";

export function PushToggle({ eventId }: { eventId: string }) {
  const [state, setState] = useState<State>("checking");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!VAPID_PUBLIC) {
        setState("no-vapid");
        return;
      }
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState("unsupported");
        return;
      }
      try {
        const reg =
          (await navigator.serviceWorker.getRegistration()) ||
          (await navigator.serviceWorker.register("/sw.js"));
        if (cancelled) return;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          setEndpoint(sub.endpoint);
          setState(Notification.permission === "denied" ? "denied" : "subscribed");
        } else {
          setState(Notification.permission === "denied" ? "denied" : "unsubscribed");
        }
      } catch {
        setState("unsupported");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = async () => {
    const reg =
      (await navigator.serviceWorker.getRegistration()) ||
      (await navigator.serviceWorker.register("/sw.js"));

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setState("denied");
      return;
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC).buffer as ArrayBuffer,
    });

    const json = sub.toJSON();
    startTransition(async () => {
      await subscribePush({
        eventId,
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
        label: navigator.userAgent.slice(0, 60),
      });
      setEndpoint(sub.endpoint);
      setState("subscribed");
    });
  };

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub && endpoint) {
      await sub.unsubscribe();
      startTransition(async () => {
        await unsubscribePush(eventId, endpoint);
        setEndpoint(null);
        setState("unsubscribed");
      });
    }
  };

  const test = () => {
    startTransition(async () => {
      await sendTestNotif(eventId);
    });
  };

  if (state === "checking") {
    return (
      <p className="text-xs text-muted-foreground">Vérification des notifs…</p>
    );
  }
  if (state === "no-vapid") {
    return (
      <p className="text-xs text-muted-foreground italic">
        Notifs push : VAPID non configuré côté serveur.
      </p>
    );
  }
  if (state === "unsupported") {
    return (
      <p className="text-xs text-muted-foreground italic">
        Ton navigateur ne supporte pas les notifs push (essaie sur Chrome / Safari iOS 16.4+ avec l'app installée sur l'écran d'accueil).
      </p>
    );
  }
  if (state === "denied") {
    return (
      <p className="text-xs text-red-600">
        Notifs bloquées par ton navigateur. Active-les dans les paramètres du
        site.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {state === "subscribed" ? (
        <>
          <span className="bbq-pill bbq-pill-active">● Notifs actives</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={test}
            disabled={pending}
            className="h-7 text-xs"
          >
            Test
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={unsubscribe}
            disabled={pending}
            className="h-7 text-xs text-muted-foreground"
          >
            Désactiver
          </Button>
        </>
      ) : (
        <Button
          type="button"
          size="sm"
          onClick={subscribe}
          disabled={pending}
          className="h-8 bg-coal hover:bg-coal/90 text-ivory"
        >
          🔔 Activer les notifs sur cet appareil
        </Button>
      )}
    </div>
  );
}
