export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": "Dockwood Furniture's",
    "image": "https://dockwoodfurnitures.co.ke/logo.png",
    "@id": "https://dockwoodfurnitures.co.ke",
    "url": "https://dockwoodfurnitures.co.ke",
    "telephone": "+254741157757",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bombolulu, Kisimani, Opposite Nivash Supermarket",
      "addressLocality": "Mombasa",
      "addressRegion": "Coast",
      "postalCode": "80100",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -4.0326,
      "longitude": 39.7027
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
      "https://facebook.com/dockwoodfurnitures",
      "https://instagram.com/dockwoodfurnitures"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
