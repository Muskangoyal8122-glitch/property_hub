import { useState } from "react";

export default function ListPropertyForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    type: "rent",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    image: "",
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title || !form.location || !form.price) return;

    onSubmit({
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
    });
  }

  return (
    <div className="list-form-overlay" onClick={onClose}>
      <form className="list-form" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <div className="form-head">
          <h3>List Property</h3>
          <button type="button" onClick={onClose}>
            x
          </button>
        </div>

        <label>
          Title
          <input
            placeholder="2BHK near city center"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
          />
        </label>

        <label>
          Location
          <input
            placeholder="Noida, Delhi, Jaipur..."
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
          />
        </label>

        <div className="form-grid">
          <label>
            Type
            <select value={form.type} onChange={(event) => update("type", event.target.value)}>
              <option value="rent">For Rent</option>
              <option value="buy">For Sale</option>
            </select>
          </label>
          <label>
            Price
            <input
              type="number"
              placeholder="25000"
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
            />
          </label>
        </div>

        <div className="form-grid">
          <label>
            Bedrooms
            <input
              type="number"
              value={form.bedrooms}
              onChange={(event) => update("bedrooms", event.target.value)}
            />
          </label>
          <label>
            Bathrooms
            <input
              type="number"
              value={form.bathrooms}
              onChange={(event) => update("bathrooms", event.target.value)}
            />
          </label>
        </div>

        <label>
          Area
          <input
            type="number"
            placeholder="1200"
            value={form.area}
            onChange={(event) => update("area", event.target.value)}
          />
        </label>

        <label>
          Photo URL
          <input
            placeholder="https://..."
            value={form.image}
            onChange={(event) => update("image", event.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            placeholder="Write a short property description"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </label>

        <button className="btn btn-primary full-width" type="submit">
          Publish Listing
        </button>
      </form>
    </div>
  );
}
