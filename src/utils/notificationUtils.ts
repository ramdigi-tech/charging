export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser tidak mendukung notifikasi');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendChargingNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options
    });
  }
};

export const sendCharging50PercentNotification = () => {
  sendChargingNotification('Pengisian 50%', {
    body: 'Baterai kendaraan Anda sudah mencapai 50%',
    tag: 'charging-50',
    requireInteraction: false,
  });
};

export const sendCharging100PercentNotification = () => {
  sendChargingNotification('Pengisian Selesai', {
    body: 'Baterai kendaraan Anda sudah penuh 100%',
    tag: 'charging-100',
    requireInteraction: true,
  });
};
