import { useMemo, useState } from "react";

const properties = [
  {
    id: 1,
    title: "Modern Family House",
    location: "Green Park, Delhi",
    price: "Rs. 72 Lac",
    purpose: "Buy",
    type: "House",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80",
    details: ["3 Bedrooms", "2 Bathrooms", "1800 sq.ft"],
  },
  {
    id: 2,
    title: "Premium City Apartment",
    location: "Sector 62, Noida",
    price: "Rs. 24,000/month",
    purpose: "Rent",
    type: "Apartment",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    details: ["2 Bedrooms", "2 Bathrooms", "980 sq.ft"],
  },
  {
    id: 3,
    title: "Luxury Villa",
    location: "Golf Course Road, Gurugram",
    price: "Rs. 1.8 Cr",
    purpose: "Buy",
    type: "Villa",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    details: ["4 Bedrooms", "4 Bathrooms", "3200 sq.ft"],
  },
  {
    id: 4,
    title: "Comfort Rental Flat",
    location: "Lajpat Nagar, Delhi",
    price: "Rs. 18,500/month",
    purpose: "Rent",
    type: "Flat",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    details: ["2 Bedrooms", "1 Bathroom", "760 sq.ft"],
  },
];

function App() {
  const [activePage, setActivePage] = useState("home");
  const [filters, setFilters] = useState({
    purpose: "Rent",
    location: "",
    type: "House",
  });

  const filteredProperties = useMemo(() => {
    const location = filters.location.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesPurpose = property.purpose === filters.purpose;
      const matchesType = property.type === filters.type;
      const matchesLocation =
        location === "" || property.location.toLowerCase().includes(location);

      return matchesPurpose && matchesType && matchesLocation;
    });
  }, [filters]);

  const goHome = () => setActivePage("home");

  return (
    <>
      <Header activePage={activePage} setActivePage={setActivePage} />

      {activePage === "login" && <LoginPage goHome={goHome} setActivePage={setActivePage} />}
      {activePage === "register" && <RegisterPage goHome={goHome} />}
      {activePage === "home" && (
        <HomePage
          filters={filters}
          setFilters={setFilters}
          filteredProperties={filteredProperties}
          setActivePage={setActivePage}
        />
      )}
    </>
  );
}

function Header({ activePage, setActivePage }) {
  return (
    <header>
      <div className="navbar">
        <button className="logo" onClick={() => setActivePage("home")}>
          Property <span>Hub</span>
        </button>

        <nav>
          <a href="#buy" onClick={() => setActivePage("home")}>
            Buy
          </a>
          <a href="#rent" onClick={() => setActivePage("home")}>
            Rent
          </a>
          <a href="#properties" onClick={() => setActivePage("home")}>
            Properties
          </a>
          <a href="#contact" onClick={() => setActivePage("home")}>
            Contact
          </a>
        </nav>

        <div className="nav-actions">
          <button
            className={`btn ${activePage === "login" ? "btn-primary" : "btn-light"}`}
            onClick={() => setActivePage("login")}
          >
            Login
          </button>
          <button className="btn btn-primary" onClick={() => setActivePage("register")}>
            Register
          </button>
        </div>
      </div>
    </header>
  );
}

function HomePage({ filters, setFilters, filteredProperties, setActivePage }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <h1>Property Hub</h1>
            <p>Find houses, flats, and family homes for rent or purchase in one simple place.</p>
          </div>

          <form className="search-box" onSubmit={(event) => event.preventDefault()}>
            <select name="purpose" value={filters.purpose} onChange={handleChange}>
              <option>Rent</option>
              <option>Buy</option>
            </select>
            <input
              name="location"
              value={filters.location}
              onChange={handleChange}
              type="text"
              placeholder="Enter city or location"
            />
            <select name="type" value={filters.type} onChange={handleChange}>
              <option>House</option>
              <option>Flat</option>
              <option>Villa</option>
              <option>Apartment</option>
            </select>
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>
        </div>
      </section>

      <section id="buy">
        <div className="container">
          <div className="section-heading">
            <h2>Choose How You Want To Move</h2>
            <p>Property Hub helps users compare homes for rent and purchase after login.</p>
          </div>

          <div className="category-grid">
            <InfoCard title="Buy a Home">
              Explore ready-to-move houses, apartments, and villas for long-term ownership.
            </InfoCard>
            <InfoCard title="Rent a Place" id="rent">
              Find budget-friendly rental homes near colleges, offices, markets, and transport.
            </InfoCard>
            <InfoCard title="Compare Easily">
              Check price, rooms, location, and basic details before selecting a property.
            </InfoCard>
          </div>
        </div>
      </section>

      <section id="properties">
        <div className="container">
          <div className="section-heading">
            <h2>Featured Properties</h2>
            <p>Use the search controls above to filter rent and purchase options.</p>
          </div>

          <div className="property-grid">
            {(filteredProperties.length > 0 ? filteredProperties : properties).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band" id="contact">
        <div className="container cta-wrap">
          <div>
            <h2>Ready to find your next home?</h2>
            <p>Login to view more houses and save your favourite properties.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setActivePage("login")}>
            Login Now
          </button>
        </div>
      </section>

      <footer>
        <p>Copyright 2026 Property Hub. All rights reserved.</p>
      </footer>
    </main>
  );
}

function InfoCard({ title, children, id }) {
  return (
    <article className="category" id={id}>
      <strong>{title}</strong>
      <p>{children}</p>
    </article>
  );
}

function PropertyCard({ property }) {
  return (
    <article className="property-card">
      <img src={property.image} alt={property.title} />
      <div className="property-content">
        <span className="tag">For {property.purpose === "Buy" ? "Sale" : "Rent"}</span>
        <h3>{property.title}</h3>
        <p>{property.location}</p>
        <p className="price">{property.price}</p>
        <div className="details">
          {property.details.map((detail) => (
            <span key={detail}>{detail}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function LoginPage({ goHome, setActivePage }) {
  return (
    <main className="auth-page login-page">
      <section className="auth-box">
        <h1>Property Hub</h1>
        <p>Login to view houses for rent and purchase.</p>

        <form onSubmit={(event) => event.preventDefault()}>
          <input type="text" placeholder="Username or Email" required />
          <input type="password" placeholder="Password" required />
          <button className="btn btn-primary full-button" type="submit">
            Login
          </button>
        </form>

        <div className="auth-links">
          <button onClick={goHome}>Back Home</button>
          <button onClick={() => setActivePage("register")}>Create Account</button>
        </div>
      </section>
    </main>
  );
}

function RegisterPage({ goHome }) {
  return (
    <main className="auth-page">
      <section className="register-box">
        <h1>Create Account</h1>
        <p>Register on Property Hub to explore homes for rent or purchase.</p>

        <form onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <Field label="Full Name">
              <input type="text" required />
            </Field>
            <Field label="Mobile Number">
              <input type="tel" required />
            </Field>
            <Field label="Email" wide>
              <input type="email" required />
            </Field>
            <Field label="Looking For">
              <select>
                <option>Rent</option>
                <option>Buy</option>
                <option>Both</option>
              </select>
            </Field>
            <Field label="Preferred City">
              <input type="text" placeholder="Delhi, Noida, Gurugram" />
            </Field>
            <Field label="Address" wide>
              <textarea />
            </Field>
            <Field label="Password">
              <input type="password" required />
            </Field>
            <Field label="Confirm Password">
              <input type="password" required />
            </Field>
          </div>

          <div className="form-actions">
            <button className="text-button" type="button" onClick={goHome}>
              Back Home
            </button>
            <button className="btn btn-primary" type="submit">
              Register
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children, wide }) {
  return (
    <label className={wide ? "field field-wide" : "field"}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export default App;
