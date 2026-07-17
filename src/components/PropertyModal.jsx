export default function PropertyModal({ property, onClose }) {
  if (!property) return null;

  const isRent = property.type === "rent";
  const price = Number(property.price || 0).toLocaleString("en-IN");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          x
        </button>

        <div className="modal-image">
          {property.image ? (
            <img src={property.image} alt={property.title} />
          ) : (
            <div className="image-placeholder">Property Hub</div>
          )}
        </div>

        <div className="modal-body">
          <span className={isRent ? "badge rent" : "badge buy"}>
            {isRent ? "For Rent" : "For Sale"}
          </span>
          <h2>{property.title}</h2>
          <p className="modal-price">
            Rs. {price}
            {isRent ? " /month" : ""}
          </p>
          <p className="location">{property.location}</p>

          <div className="modal-meta">
            <div>
              <strong>{property.bedrooms || 0}</strong>
              <span>Bedrooms</span>
            </div>
            <div>
              <strong>{property.bathrooms || 0}</strong>
              <span>Bathrooms</span>
            </div>
            <div>
              <strong>{property.area || 0}</strong>
              <span>Sqft</span>
            </div>
          </div>

          <p className="description">
            {property.description ||
              "No detailed description has been added yet. Contact the owner for more information."}
          </p>

          <button
            className="btn btn-primary full-width"
            onClick={() => alert("Contact owner feature can be added here.")}
          >
            Contact Owner
          </button>
        </div>
      </div>
    </div>
  );
}
