export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": "Dockwood Furnitures",
    "image": "https://dockwoodfurnitures.com/logo.jpeg",
    "@id": "https://dockwoodfurnitures.com",
    "url": "https://dockwoodfurnitures.com",
    "telephone": "+254711662626",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bombolulu, Kisimani, Opposite Nivash Supermarket, Opposite Petrocity",
      "addressLocality": "Mombasa",
      "addressRegion": "Coast",
      "postalCode": "80100",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -4.029404,
      "longitude": 39.693963
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "08:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://web.facebook.com/profile.php?id=61555310847954",
      "https://www.instagram.com/dock_wood_kenya/"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
