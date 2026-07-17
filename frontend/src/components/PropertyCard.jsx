export default function PropertyCard({ property, onOpen }) {
  const isRent = property.type === "rent";
  const price = Number(property.price || 0).toLocaleString("en-IN");

  return (
    <article className="property-card" onClick={() => onOpen(property)}>
      <div className="property-image">
        {property.image ? (
          <img src={property.image} alt={property.title} />
        ) : (
          <div className="image-placeholder">Property Hub</div>
        )}
        <span className={isRent ? "badge rent" : "badge buy"}>
          {isRent ? "For Rent" : "For Sale"}
        </span>
      </div>

      <div className="property-body">
        <p className="price">
          Rs. {price}
          {isRent ? <small> /month</small> : null}
        </p>
        <h3>{property.title}</h3>
        <p className="location">{property.location}</p>
        <div className="meta-row">
          <span>{property.bedrooms || 0} Bed</span>
          <span>{property.bathrooms || 0} Bath</span>
          <span>{property.area || 0} sqft</span>
        </div>
      </div>
    </article>
  );
}
