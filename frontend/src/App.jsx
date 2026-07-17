import { useMemo, useState } from "react";
import GoogleLoginButton from "./components/GoogleLoginButton.jsx";
import {
  createPaymentOrder,
  fetchHouses,
  verifyPaymentSuccess,
} from "./api/propertyApi.js";

const initialHouses = await fetchHouses();
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SjOOD4SfcQ88sp";
const ADMIN_PASSWORD = "property123";
const ADMIN_EMAILS = ["goyalmuskan821@gmail.com", "softcloudhub09@gmail.com"];
const isAdminUser = (profile) => ADMIN_EMAILS.includes((profile?.email || "").toLowerCase());
const SAVED_USER_KEY = "propertyHubUser";

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_USER_KEY));
  } catch {
    return null;
  }
}

function saveUser(profile) {
  localStorage.setItem(SAVED_USER_KEY, JSON.stringify(profile));
}

function clearSavedUser() {
  localStorage.removeItem(SAVED_USER_KEY);
}
const emptyAdminForm = {
  id: "",
  purpose: "rent",
  stayType: "night",
  duration: "",
  title: "",
  city: "Delhi",
  location: "",
  price: "",
  bookingAmount: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  image: "",
  description: "",
};

export default function App() {
  const isAdminPortal = window.location.pathname === "/admin";
  const [user, setUser] = useState(() => readSavedUser());
  const [houses, setHouses] = useState(initialHouses);
  const [purpose, setPurpose] = useState("rent");
  const [city, setCity] = useState("all");
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [paymentHouse, setPaymentHouse] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [adminAccess, setAdminAccess] = useState(false);
  const [stayDates, setStayDates] = useState({ from: "", to: "" });

  function handleGoogleLogin(profile) {
    saveUser(profile);
    setUser(profile);
  }

  function handleLogout() {
    clearSavedUser();
    setUser(null);
  }

  const filteredHouses = useMemo(() => {
    return houses.filter((house) => {
      const matchesPurpose = house.purpose === purpose;
      const matchesCity = city === "all" || house.city === city;
      return matchesPurpose && matchesCity;
    });
  }, [houses, purpose, city]);

  if (isAdminPortal) {
    if (!user) {
      return <LoginScreen onGoogleLogin={handleGoogleLogin} />;
    }

    if (!isAdminUser(user)) {
      return <AdminBlocked user={user} onLogout={handleLogout} />;
    }

    return (
      <AdminPortal
        adminAccess={adminAccess}
        houses={houses}
        onAdminAccess={setAdminAccess}
        onAddProperty={(property) => setHouses((current) => [property, ...current])}
        onUpdateProperty={(property) =>
          setHouses((current) =>
            current.map((house) => (house.id === property.id ? property : house))
          )
        }
        onDeleteProperty={(propertyId) =>
          setHouses((current) => current.filter((house) => house.id !== propertyId))
        }
      />
    );
  }

  async function handlePayment(event) {
    event.preventDefault();

    if (paymentHouse.purpose === "stay") {
      if (!stayDates.from || !stayDates.to) {
        setPaymentStatus("Please select check-in and check-out dates.");
        return;
      }

      if (stayDates.to < stayDates.from) {
        setPaymentStatus("Check-out date must be after check-in date.");
        return;
      }
    }

    setPaymentStatus("Opening Razorpay...");

    try {
      await loadRazorpayCheckout();
      let order;

      try {
        order = await createPaymentOrder({
          houseId: paymentHouse.id,
          amount: paymentHouse.bookingAmount,
        });
      } catch {
        order = {
          orderId: "",
          keyId: RAZORPAY_KEY_ID,
          amount: paymentHouse.bookingAmount,
          currency: "INR",
          status: "checkout-only",
        };
      }

      const razorpay = new window.Razorpay({
        key: order.keyId || RAZORPAY_KEY_ID,
        amount: paymentHouse.bookingAmount * 100,
        currency: order.currency || "INR",
        name: "Property Hub",
        description:
          paymentHouse.purpose === "stay"
            ? `Booking for ${paymentHouse.title} (${stayDates.from} to ${stayDates.to})`
            : `Booking for ${paymentHouse.title}`,
        ...(order.orderId ? { order_id: order.orderId } : {}),
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#0f766e",
        },
        handler: async (response) => {
          if (!order.orderId) {
            setPaymentStatus(`Payment started. Payment ID: ${response.razorpay_payment_id}`);
            return;
          }

          setPaymentStatus("Verifying payment...");
          const verified = await verifyPaymentSuccess({
            orderCreationId: order.orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });

          setPaymentStatus(
            `Payment ${verified.msg}. Payment ID: ${verified.paymentId}`
          );
        },
        modal: {
          ondismiss: () => setPaymentStatus("Payment cancelled."),
        },
      });

      razorpay.open();
    } catch (error) {
      setPaymentStatus(error.message);
    }
  }

  if (!user) {
    return <LoginScreen onGoogleLogin={handleGoogleLogin} />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span>PH</span>
          <div>
            <strong>Property Hub</strong>
            <small>Rent and buy verified homes</small>
          </div>
        </div>

        <nav>
          <a href="#houses">Houses</a>
          {isAdminUser(user) && <a href="/admin">Admin</a>}
          <button onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Welcome, {user.name}</p>
            <h1>Choose your next home or short stay.</h1>
            <p>
              Explore comfortable houses for rent, purchase, or Airbnb-style day and night stays
              with clear prices and easy booking.
            </p>

            <div className="search-panel">
              <div className="tabs" aria-label="Choose property type">
                <button className={purpose === "rent" ? "active" : ""} onClick={() => setPurpose("rent")}>
                  Rent
                </button>
                <button className={purpose === "buy" ? "active" : ""} onClick={() => setPurpose("buy")}>
                  Buy
                </button>
                <button className={purpose === "stay" ? "active" : ""} onClick={() => setPurpose("stay")}>
                  Stays
                </button>
              </div>

              <select value={city} onChange={(event) => setCity(event.target.value)}>
                <option value="all">All Cities</option>
                <option value="Delhi">Delhi</option>
                <option value="Noida">Noida</option>
                <option value="Gurugram">Gurugram</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Rishikesh">Rishikesh</option>
                <option value="Goa">Goa</option>
              </select>
            </div>
          </div>

          <div className="hero-card">
            <strong>{filteredHouses.length}</strong>
            <span>{getPurposeLabel(purpose)}</span>
            <p>{purpose === "stay" ? "Short stays from Rs. 1,499" : "Booking starts from Rs. 999"}</p>
          </div>
        </section>

        <section className="section" id={purpose === "stay" ? "stays" : "houses"}>
          <div className="section-head">
            <div>
              <p className="eyebrow">{purpose === "stay" ? "Airbnb Style Stays" : "Available Houses"}</p>
              <h2>{getSectionTitle(purpose)}</h2>
            </div>
            <span>{filteredHouses.length} results</span>
          </div>

          <div className="house-grid">
            {filteredHouses.map((house) => (
              <HouseCard
                key={house.id}
                house={house}
                onView={setSelectedHouse}
                onPay={setPaymentHouse}
              />
            ))}
          </div>
        </section>

        <section className="payment-info" id="payment">
          <h2>Razorpay Payment Included</h2>
          <p>
            Click Book Now on any house to create a Razorpay order and complete payment through the
            official Razorpay checkout popup.
          </p>
        </section>

      </main>

      {selectedHouse && <DetailsModal house={selectedHouse} onClose={() => setSelectedHouse(null)} />}

      {paymentHouse && (
        <PaymentModal
          house={paymentHouse}
        status={paymentStatus}
          stayDates={stayDates}
          onDateChange={setStayDates}
          onClose={() => {
            setPaymentHouse(null);
            setPaymentStatus("");
            setStayDates({ from: "", to: "" });
          }}
          onSubmit={handlePayment}
        />
      )}
    </div>
  );
}

function AdminBlocked({ user, onLogout }) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span>PH</span>
          <div>
            <strong>Property Hub</strong>
            <small>Rent and buy verified homes</small>
          </div>
        </div>
        <nav>
          <a href="/">Website</a>
          <button onClick={onLogout}>Logout</button>
        </nav>
      </header>
      <main>
        <section className="admin-section">
          <div className="admin-card admin-login">
            <p className="eyebrow">Access Denied</p>
            <h1>Admin panel is not available for this account.</h1>
            <p>{user.email}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function AdminPortal(props) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span>PH</span>
          <div>
            <strong>Property Hub Admin</strong>
            <small>Manage properties</small>
          </div>
        </div>

        <nav>
          <a href="/">Website</a>
        </nav>
      </header>

      <main>
        <AdminPanel {...props} />
      </main>
    </div>
  );
}

function LoginScreen({ onGoogleLogin }) {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand large">
          <span>PH</span>
          <div>
            <strong>Property Hub</strong>
            <small>Find houses for rent and buy</small>
          </div>
        </div>

        <h1>Sign in to explore homes</h1>
        <p>
          Continue with your Google account to see verified houses, compare rent and buy options,
          and book your favourite property.
        </p>

        <GoogleLoginButton onLogin={onGoogleLogin} />
      </section>
    </main>
  );
}

function HouseCard({ house, onView, onPay }) {
  const price = house.price.toLocaleString("en-IN");
  const badge = getCardBadge(house);
  const priceSuffix = getPriceSuffix(house);

  return (
    <article className="house-card">
      <div className="house-image">
        <img src={house.image} alt={house.title} />
        <span>{badge}</span>
      </div>

      <div className="house-body">
        <h3>{house.title}</h3>
        <p className="location">{house.location}</p>
        <p className="price">
          Rs. {price}
          {priceSuffix ? <small> {priceSuffix}</small> : null}
        </p>

        <div className="features">
          <span>{house.bedrooms} Bed</span>
          <span>{house.bathrooms} Bath</span>
          <span>{house.area} sqft</span>
          {house.duration ? <span>{house.duration}</span> : null}
        </div>

        <div className="actions">
          <button className="btn light" onClick={() => onView(house)}>
            View Details
          </button>
          <button className="btn primary" onClick={() => onPay(house)}>
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
}

function DetailsModal({ house, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="close" onClick={onClose}>
          x
        </button>
        <img src={house.image} alt={house.title} />
        <div className="modal-content">
          <h2>{house.title}</h2>
          <p className="location">{house.location}</p>
          <p className="price">
            Rs. {house.price.toLocaleString("en-IN")}
            {getPriceSuffix(house) ? <small> {getPriceSuffix(house)}</small> : null}
          </p>
          <p>{house.description}</p>
          <div className="features">
            <span>{house.bedrooms} Bedrooms</span>
            <span>{house.bathrooms} Bathrooms</span>
            <span>{house.area} sqft</span>
            {house.duration ? <span>{house.duration}</span> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function PaymentModal({ house, status, stayDates, onDateChange, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal payment-modal" onClick={(event) => event.stopPropagation()}>
        <button className="close" onClick={onClose}>
          x
        </button>
        <div className="modal-content">
          <h2>Book Property</h2>
          <p>{house.title}</p>
          <div className="payment-summary">
            <span>Booking Amount</span>
            <strong>Rs. {house.bookingAmount.toLocaleString("en-IN")}</strong>
          </div>

          <form onSubmit={onSubmit}>
            {house.purpose === "stay" ? (
              <div className="date-row">
                <label>
                  Check-in
                  <input
                    type="date"
                    value={stayDates.from}
                    onChange={(event) =>
                      onDateChange((current) => ({ ...current, from: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Check-out
                  <input
                    type="date"
                    value={stayDates.to}
                    min={stayDates.from}
                    onChange={(event) =>
                      onDateChange((current) => ({ ...current, to: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
            ) : null}
            <p className="razorpay-note">
              Payment will open in Razorpay Checkout. Use Razorpay test payment details for testing.
            </p>
            <button className="btn primary full" type="submit">
              Pay with Razorpay
            </button>
          </form>

          {status && <p className="payment-status">{status}</p>}
        </div>
      </section>
    </div>
  );
}

function AdminPanel({
  adminAccess,
  houses,
  onAdminAccess,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}) {
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyAdminForm);

  function handleAdminLogin(event) {
    event.preventDefault();
    const email = loginEmail.trim().toLowerCase();

    if (!ADMIN_EMAILS.includes(email)) {
      setAdminError("Choose a valid admin email.");
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      setAdminError("Wrong admin password.");
      return;
    }

    setAdminError("");
    setPassword("");
    onAdminAccess(true);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleEditSelect(event) {
    const id = event.target.value;
    setEditingId(id);

    if (!id) {
      setForm(emptyAdminForm);
      return;
    }

    const property = houses.find((house) => house.id === id);
    if (property) {
      setForm({
        ...emptyAdminForm,
        ...property,
        price: String(property.price),
        bookingAmount: String(property.bookingAmount),
        bedrooms: String(property.bedrooms),
        bathrooms: String(property.bathrooms),
        area: String(property.area),
      });
    }
  }

  function handlePropertySubmit(event) {
    event.preventDefault();

    const property = {
      ...form,
      id: editingId || `${form.purpose}-${Date.now()}`,
      price: Number(form.price),
      bookingAmount: Number(form.bookingAmount),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: Number(form.area),
      duration: form.purpose === "stay" ? form.duration : "",
      stayType: form.purpose === "stay" ? form.stayType : undefined,
    };

    if (editingId) {
      onUpdateProperty(property);
    } else {
      onAddProperty(property);
    }

    setEditingId("");
    setForm(emptyAdminForm);
  }

  function handleDeleteProperty() {
    if (!editingId) {
      setAdminError("Select a property first.");
      return;
    }

    onDeleteProperty(editingId);
    setAdminError("");
    setEditingId("");
    setForm(emptyAdminForm);
  }

  return (
    <section className="admin-section" id="admin">
      <div className="section-head">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h2>Add or Edit Properties</h2>
        </div>
        {adminAccess ? <span>Access active</span> : <span>Admin login required</span>}
      </div>

      {!adminAccess ? (
        <form className="admin-card admin-login" onSubmit={handleAdminLogin}>
          <label>
            Choose admin account
            <select
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              required
            >
              <option value="">Select admin email</option>
              {ADMIN_EMAILS.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {adminError && <p className="form-error">{adminError}</p>}
          <button className="btn primary full" type="submit">
            Open Admin Panel
          </button>
        </form>
      ) : (
        <div className="admin-grid">
          <form className="admin-card admin-form" onSubmit={handlePropertySubmit}>
            <div className="admin-edit-row">
              <label>
                Edit or delete existing property
                <select value={editingId} onChange={handleEditSelect}>
                  <option value="">Add new property</option>
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.title} - {house.city}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="btn danger delete-selected"
                type="button"
                onClick={handleDeleteProperty}
                disabled={!editingId}
              >
                Delete Selected
              </button>
            </div>

            <div className="form-row">
              <label>
                Type
                <select value={form.purpose} onChange={(event) => updateField("purpose", event.target.value)}>
                  <option value="rent">Rent</option>
                  <option value="buy">Buy</option>
                  <option value="stay">Stay</option>
                </select>
              </label>
              <label>
                City
                <select value={form.city} onChange={(event) => updateField("city", event.target.value)}>
                  <option value="Delhi">Delhi</option>
                  <option value="Noida">Noida</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Rishikesh">Rishikesh</option>
                  <option value="Goa">Goa</option>
                </select>
              </label>
            </div>

            <label>
              Title
              <input value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
            </label>
            <label>
              Location
              <input value={form.location} onChange={(event) => updateField("location", event.target.value)} required />
            </label>
            <label>
              Image URL
              <input value={form.image} onChange={(event) => updateField("image", event.target.value)} required />
            </label>

            <div className="form-row">
              <label>
                Price
                <input type="number" value={form.price} onChange={(event) => updateField("price", event.target.value)} required />
              </label>
              <label>
                Booking amount
                <input type="number" value={form.bookingAmount} onChange={(event) => updateField("bookingAmount", event.target.value)} required />
              </label>
            </div>

            <div className="form-row three">
              <label>
                Beds
                <input type="number" value={form.bedrooms} onChange={(event) => updateField("bedrooms", event.target.value)} required />
              </label>
              <label>
                Baths
                <input type="number" value={form.bathrooms} onChange={(event) => updateField("bathrooms", event.target.value)} required />
              </label>
              <label>
                Sqft
                <input type="number" value={form.area} onChange={(event) => updateField("area", event.target.value)} required />
              </label>
            </div>

            {form.purpose === "stay" ? (
              <div className="form-row">
                <label>
                  Stay type
                  <select value={form.stayType} onChange={(event) => updateField("stayType", event.target.value)}>
                    <option value="night">Night</option>
                    <option value="day">Day</option>
                  </select>
                </label>
                <label>
                  Duration
                  <input
                    placeholder="1 Night Stay"
                    value={form.duration}
                    onChange={(event) => updateField("duration", event.target.value)}
                    required
                  />
                </label>
              </div>
            ) : null}

            <label>
              Description
              <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} required />
            </label>

            <button className="btn primary full" type="submit">
              {editingId ? "Save Changes" : "Add Property"}
            </button>
          </form>

          <div className="admin-card admin-help">
            <h3>Admin Emails</h3>
            <p>Only these two emails can open this panel.</p>
            {ADMIN_EMAILS.map((email) => (
              <span className="admin-email" key={email}>{email}</span>
            ))}
            <div className="delete-list">
              <h3>Delete Properties</h3>
              <p>Select any property below to remove it.</p>
              {houses.map((house) => (
                <div className="delete-item" key={house.id}>
                  <div>
                    <strong>{house.title}</strong>
                    <small>{house.city} - {getCardBadge(house)}</small>
                  </div>
                  <button
                    className="mini-delete"
                    type="button"
                    onClick={() => {
                      onDeleteProperty(house.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function loadRazorpayCheckout() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
    document.body.appendChild(script);
  });
}

function getPurposeLabel(purpose) {
  if (purpose === "rent") return "Rental homes";
  if (purpose === "buy") return "Homes for sale";
  return "Short stays";
}

function getSectionTitle(purpose) {
  if (purpose === "rent") return "Reasonable Rent Options";
  if (purpose === "buy") return "Buy Your Dream Home";
  return "Flats, Houses and Farmhouses for Short Stay";
}

function getCardBadge(house) {
  if (house.purpose === "rent") return "For Rent";
  if (house.purpose === "buy") return "For Sale";
  return house.duration || (house.stayType === "day" ? "Day Stay" : "Night Stay");
}

function getPriceSuffix(house) {
  if (house.purpose === "rent") return "/month";
  if (house.purpose === "stay") return house.stayType === "day" ? "/day" : "/night";
  return "";
}
