export interface LocationData {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung oleh browser ini'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        let errorMessage = 'Tidak dapat mendapatkan lokasi';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Izin lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia';
            break;
          case error.TIMEOUT:
            errorMessage = 'Waktu permintaan lokasi habis';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  });
};

export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=id`
    );

    if (!response.ok) {
      throw new Error('Gagal mendapatkan alamat');
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('Google Maps API key tidak valid atau tidak memiliki izin');
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } else {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  } catch (error) {
    console.error('Error getting address:', error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

export const detectLocation = async (): Promise<LocationData> => {
  const position = await getCurrentLocation();
  const { latitude, longitude } = position.coords;

  const address = await getAddressFromCoordinates(latitude, longitude);

  return {
    address,
    coordinates: {
      latitude,
      longitude
    }
  };
};
