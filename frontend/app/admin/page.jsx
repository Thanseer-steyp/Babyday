"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import OrderCard from "../../components/includes/OrderCard";

const TABS = [
  { key: "products", label: "All Products" },
  { key: "available", label: "Available Products" },
  { key: "unavailable", label: "Unavailable Products" },
  { key: "low-stock", label: "Low-Stock Products" },
  { key: "out-of-stock", label: "Stock-Out Products" },
  { key: "orders", label: "All Orders" },
  { key: "prepaid", label: "All Prepaid Orders" },
  { key: "pending", label: "Pending Shipment Orders" },
  { key: "intransit", label: "Intransit Orders" },
  { key: "delivered", label: "Delivered Orders" },
];

const AGE_CHOICES = [
  "kids_boy",
  "kids_girl",
  "kids_unisex",
  "adults_men",
  "adults_women",
  "adults_unisex",
  "all_age_men",
  "all_age_women",
  "all_age_unisex",
];

const AGE_LABELS = {
  kids_boy: "Kids (Boys)",
  kids_girl: "Kids (Girls)",
  kids_unisex: "Kids (Unisex)",
  adults_men: "Adults (Men)",
  adults_women: "Adults (Women)",
  adults_unisex: "Adults (Unisex)",
  all_age_men: "All-Age (Men)",
  all_age_women: "All-Age (Women)",
  all_age_unisex: "All-Age (Unisex)",
};

const PRODUCT_CATEGORIES = ["cloth", "jewellery"];

const SIZE_CHOICES = [
  "S",
  "M",
  "L",
  "XL",
  "FREE",
  "0-1 Years",
  "1-2 Years",
  "2-3 Years",
  "3-4 Years",
  "4-5 Years",
  "5-6 Years",
  "6-7 Years",
  "7-8 Years",
  "8-9 Years",
  "9-10  Years",
  "10-11  Years",
  "11-12  Years",
  "12-13  Years",
  "13-14  Years",
  "14-15  Years",
  "15-16  Years",
  "16-17  Years",
  "17-18  Years",
  "26",
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
];

/* ================= PAGE ================= */
export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [images, setImages] = useState({});
  const [removedImages, setRemovedImages] = useState({});
  const [active, setActive] = useState("products");
  const [orders, setOrders] = useState([]);
  const [prepaidOrders, setPrepaidOrders] = useState([]);
  const [pendingShipmentOrders, setPendingShipmentOrders] = useState([]);
  const [intransitOrders, setIntransitOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [unAvailableProducts, setUnAvailableProducts] = useState([]);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDiscount = (mrp, price) => {
    const discount =
      ((parseFloat(mrp) - parseFloat(price)) / parseFloat(mrp)) * 100;
    return Math.round(discount);
  };

  const renderOrderSection = (title, ordersList, emptyMessage) => (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ordersList.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            copiedOrderId={copiedOrderId}
            onCopyAddress={copyAddress}
            onDeliveryUpdated={refreshOrders}
          />
        ))}
      </div>
      {ordersList.length === 0 && (
        <p className="text-gray-500 mt-6 text-center">{emptyMessage}</p>
      )}
    </div>
  );

  const copyAddress = async (order) => {
    const address = `${order.name}\n${order.phone}${
      order.alt_phone ? ` / ${order.alt_phone}` : ""
    }\n${order.address_line}, ${order.location}\n${order.city}, ${
      order.state
    } - ${order.pincode}${
      order.landmark ? `\nLandmark: ${order.landmark}` : ""
    }`;

    try {
      await navigator.clipboard.writeText(address);
      setCopiedOrderId(order.id);
      setTimeout(() => {
        setCopiedOrderId(null);
      }, 2000);
    } catch (error) {
      alert("Failed to copy address");
    }
  };

  const loadMe = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/me/", {
        headers: authHeader(),
      });

      setMe(res.data);
    } catch (err) {
      console.error("Unauthorized", err);
    } finally {
      setLoadingUser(false);
    }
  };
  useEffect(() => {
    loadMe();
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    loadProducts(searchQuery);
  };

  // 👇 define it OUTSIDE useEffect
  const loadProducts = async (q = "") => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/manager/products/`,
        {
          headers: authHeader(),
          params: { q }, // send q as query param
        }
      );
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      loadProducts(searchQuery); // Call your existing loadProducts with query
    }, 300);

    return () => clearTimeout(delay); // Cleanup on new keystroke
  }, [searchQuery]);

  const loadOrders = async (q = "") => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/manager/all-orders/",
        {
          headers: authHeader(),
          params: { q }, // send search query to backend
        }
      );
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadOrders(orderSearchQuery); // fetch from backend
    }, 300); // wait 300ms after typing

    return () => clearTimeout(timeout); // cancel previous timeout
  }, [orderSearchQuery]);

  const refreshOrders = async () => {
    await Promise.all([
      loadOrders(),
      loadPrepaidOrders(),
      loadPendingShipmentOrders(),
      loadIntransitOrders(),
      loadDeliveredOrders(),
    ]);
  };

  const loadPrepaidOrders = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/orders/prepaid/paid/",
      { headers: authHeader() }
    );
    setPrepaidOrders(res.data);
  };

  const loadPendingShipmentOrders = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/orders/pending-shipments/",
      { headers: authHeader() }
    );
    setPendingShipmentOrders(res.data);
  };

  const loadIntransitOrders = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/orders/intransit/",
      { headers: authHeader() }
    );
    setIntransitOrders(res.data);
  };

  const loadDeliveredOrders = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/orders/delivered/",
      { headers: authHeader() }
    );
    setDeliveredOrders(res.data);
  };
  const loadOutOfStockProducts = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/products/filter/out-of-stock/",
      { headers: authHeader() }
    );
    setOutOfStockProducts(res.data);
  };

  const loadLowStockProducts = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/products/filter/low-stock/",
      { headers: authHeader() }
    );
    setLowStockProducts(res.data);
  };

  const loadAvaialableProducts = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/products/filter/available/",
      { headers: authHeader() }
    );
    setAvailableProducts(res.data);
  };

  const loadUnAvaialbleProducts = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/products/filter/unavailable/",
      { headers: authHeader() }
    );
    setUnAvailableProducts(res.data);
  };

  useEffect(() => {
    loadProducts();
    loadAvaialableProducts();
    loadUnAvaialbleProducts();
    loadLowStockProducts();
    loadOutOfStockProducts();
    loadOrders();
    loadPrepaidOrders();
    loadPendingShipmentOrders();
    loadIntransitOrders();
    loadDeliveredOrders();
  }, []);

  /* ---------- FORM ---------- */
  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      age_category: "",
      product_category: "",
      mrp: "",
      price: "",
      stock_qty: "",
      material_type: "",
      fit_type: "",
      pattern_design: "",
      age_limits: "",
      delivery_charge: "",
      available_sizes: [],
      is_available: true,
    });
    setImages({});
    setOpen(true);
  };
  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title || "",
      age_category: product.age_category || "",
      product_category: product.product_category || "",
      mrp: product.mrp || "",
      price: product.price || "",
      stock_qty: product.stock_qty || "",
      material_type: product.material_type || "",
      fit_type: product.fit_type || "",
      pattern_design: product.pattern_design || "",
      age_limits: product.age_limits || "",
      delivery_charge: product.delivery_charge || "",
      available_sizes: product.available_sizes || [],
      is_available: product.is_available ?? true,
      image1: product.image1 || null,
      image2: product.image2 || null,
      image3: product.image3 || null,
      image4: product.image4 || null,
      add_qty: "",
    });
    setImages({});
    setRemovedImages({});
    setOpen(true);
  };

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const toggleSize = (size) => {
    setForm({
      ...form,
      available_sizes: form.available_sizes.includes(size)
        ? form.available_sizes.filter((s) => s !== size)
        : [...form.available_sizes, size],
    });
  };

  const save = async () => {
    try {
      const data = new FormData();

      // normal fields
      Object.entries(form).forEach(([k, v]) => {
        if (k === "available_sizes") {
          data.append(k, JSON.stringify(v));
        } else if (!k.startsWith("image")) {
          data.append(k, v ?? "");
        }
      });

      // removed images → send empty
      Object.entries(removedImages).forEach(([k, v]) => {
        if (v === true) {
          data.append(k, "");
        }
      });

      // new images
      Object.entries(images).forEach(([k, v]) => {
        if (v instanceof File) {
          data.append(k, v);
        }
      });

      const headers = {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      };

      if (editing) {
        await axios.patch(
          `http://localhost:8000/api/v1/manager/products/${editing.slug}/`,
          data,
          { headers }
        );
      } else {
        await axios.post(
          "http://localhost:8000/api/v1/manager/products/",
          data,
          { headers }
        );
      }

      setOpen(false);
      loadProducts();
      loadAvaialableProducts();
      loadUnAvaialbleProducts();
      loadLowStockProducts();
      loadOutOfStockProducts();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const remove = async (slug) => {
    if (!confirm("Delete product?")) return;

    try {
      await axios.delete(
        `http://localhost:8000/api/v1/manager/products/${slug}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      loadProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  if (loadingUser) {
    return <p className="p-6">Checking permissions...</p>;
  }

  if (!me?.is_superuser) {
    return (
      <div className="p-10 text-center text-red-600">
        <h1 className="text-2xl font-bold">403 – Access Denied</h1>
        <p>You are not allowed to view this page.</p>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="flex w-full">
      <div className="bg-gray-100 text-black p-4 space-y-2 w-1/7">
        <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>

        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`w-full text-left px-4 py-2 rounded ${
              active === t.key ? "bg-black/50 text-white" : "hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {active === "products" && (
          <div className="p-6 text-black">
            {/* HEADER */}

            <div className="mb-4 flex justify-between">
              <h1 className="text-2xl font-semibold text-white">
                Product Management
              </h1>
              {/* Search */}
              <div className="mb-4 flex gap-2 border border-white bg-gray-100">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  className="input flex-1 text-white"
                />
              </div>

              <button
                onClick={openCreate}
                className="bg-white text-black px-4 py-2 rounded w-max"
              >
                + Add Product
              </button>
            </div>

            {/* LIST */}
            <div className="space-y-4">
              {products.map((p) => (
                <div
                  key={p.slug}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={p.image1}
                          alt={p.title}
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {p.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 capitalize">
                              {p.product_category}
                            </p>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-black text-white capitalize">
                              {p.age_category.replace(/_/g, " ")}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => openEdit(p)}
                              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => remove(p.slug)}
                              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Product Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {/* Pricing */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Price</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                ₹{p.price}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ₹{p.mrp}
                              </span>
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                {calculateDiscount(p.mrp, p.price)}% OFF
                              </span>
                            </div>
                          </div>

                          {/* Stock */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Stock</p>
                            <p className="text-sm font-medium">
                              <span className="text-gray-900">
                                {p.available_stock}
                              </span>
                              <span className="text-gray-400">
                                {" "}
                                / {p.stock_qty}
                              </span>
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className={`h-1.5 rounded-full ${
                                  p.available_stock / p.stock_qty > 0.5
                                    ? "bg-green-500"
                                    : p.available_stock / p.stock_qty > 0.2
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${
                                    (p.available_stock / p.stock_qty) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Material & Fit */}
                          <div className="space-y-1.5">
                            <p className="text-sm font-medium text-gray-900">
                              Material: {p.material_type}
                            </p>
                            <p className="text-xs text-gray-600">
                              Fit: {p.fit_type}
                            </p>
                            <p className="text-xs text-gray-600">
                              Age limit: {p.age_limits || "N/A"}
                            </p>
                          </div>

                          {/* Delivery */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Delivery Charge
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              ₹{p.delivery_charge}
                            </p>
                          </div>
                        </div>

                        {/* Additional Details Row */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Pattern:</span>
                            <span className="font-medium text-gray-700">
                              {p.pattern_design}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Sizes:</span>
                            <div className="flex gap-1">
                              {p.available_sizes.map((size) => (
                                <span
                                  key={size}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                                >
                                  {size}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Rating:</span>
                            <span className="font-medium text-gray-700">
                              {p.average_rating > 0
                                ? `${p.average_rating}/5`
                                : "No ratings"}
                              {p.rating_count > 0 && (
                                <span className="text-gray-400 ml-1">
                                  ({p.rating_count})
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Added:</span>
                            <span className="font-medium text-gray-700">
                              {formatDate(p.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                p.is_available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {p.is_available ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL */}
          </div>
        )}

        {open && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-black">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">
                  {editing ? "Edit Product" : "Add Product"}
                </h2>
                <button onClick={() => setOpen(false)}>✕</button>
              </div>

              <div>
                <label htmlFor="">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={change}
                  className="input"
                  placeholder="Title"
                />
              </div>

              <div>
                <label htmlFor="">Age Category</label>
                <select
                  name="age_category"
                  value={form.age_category}
                  onChange={change}
                  className="input"
                >
                  <option value="">Age Category</option>
                  {AGE_CHOICES.map((v) => (
                    <option key={v} value={v}>
                      {AGE_LABELS[v]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="">Product Category</label>
                <select
                  name="product_category"
                  value={form.product_category}
                  onChange={change}
                  className="input"
                >
                  <option value="">Product Category</option>
                  {PRODUCT_CATEGORIES.map((v) => (
                    <option key={v} value={v}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="">MRP</label>
                  <input
                    name="mrp"
                    value={form.mrp}
                    onChange={change}
                    className="input"
                    placeholder="MRP"
                  />
                </div>

                <div>
                  <label htmlFor="">Price</label>
                  <input
                    name="price"
                    value={form.price}
                    onChange={change}
                    className="input"
                    placeholder="Price"
                  />
                </div>
                <div>
                  <label htmlFor="">Delivery Charge</label>
                  <input
                    name="delivery_charge"
                    value={form.delivery_charge}
                    onChange={change}
                    className="input"
                    placeholder="Delivery Charge"
                  />
                </div>
                <div>
                  <label htmlFor="">Stock</label>
                  <input
                    name="stock_qty"
                    value={form.stock_qty}
                    onChange={change}
                    className="input"
                    placeholder="Stock Qty"
                  />
                </div>

                <div>
                  <label>Stocks Left</label>
                  <input
                    type="text"
                    value={editing?.available_stock}
                    disabled
                    readOnly
                    className="input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label>Add Stock</label>
                  <input
                    type="number"
                    value={form.add_qty}
                    onChange={(e) => {
                      const addQty = Number(e.target.value) || 0;

                      setForm((prev) => ({
                        ...prev,
                        add_qty: e.target.value,
                        stock_qty: (editing?.stock_qty || 0) + addQty,
                      }));
                    }}
                    className="input"
                    placeholder="Enter quantity to add"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="">Material Type</label>
                <input
                  name="material_type"
                  value={form.material_type}
                  onChange={change}
                  className="input"
                  placeholder="Material Type"
                />
              </div>

              <label htmlFor="">Fit type</label>
              <input
                name="fit_type"
                value={form.fit_type}
                onChange={change}
                className="input"
                placeholder="Fit Type"
              />

              <label htmlFor="">Pattern/Design</label>
              <input
                name="pattern_design"
                value={form.pattern_design}
                onChange={change}
                className="input"
                placeholder="Pattern Design"
              />

              <label htmlFor="">Age limits</label>
              <textarea
                name="age_limits"
                value={form.age_limits}
                onChange={change}
                className="input"
                placeholder="Age Limits"
              />

              <div>
                <p className="font-medium mb-1">Available Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {SIZE_CHOICES.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1 border rounded ${
                        form.available_sizes.includes(s)
                          ? "bg-black text-white"
                          : ""
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "image1", label: "Main Image" },
                  { key: "image2", label: "Image 2" },
                  { key: "image3", label: "Image 3" },
                  { key: "image4", label: "Image 4" },
                ].map(({ key, label }) => {
                  const hasExisting =
                    editing && form[key] && !removedImages[key];
                  const hasNew = images[key] instanceof File;

                  return (
                    <div key={key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium">{label}</label>

                      {/* Preview */}
                      {hasNew && (
                        <img
                          src={URL.createObjectURL(images[key])}
                          className="w-32 h-32 object-cover border rounded"
                        />
                      )}

                      {!hasNew && hasExisting && (
                        <img
                          src={form[key]}
                          className="w-32 h-32 object-cover border rounded"
                        />
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {/* ADD IMAGE */}
                        {!hasExisting && !hasNew && (
                          <label className="cursor-pointer">
                            <div className="bg-black text-white px-3 py-1 rounded text-sm">
                              Add Image
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setImages({
                                  ...images,
                                  [key]: e.target.files[0],
                                })
                              }
                            />
                          </label>
                        )}

                        {/* CHANGE IMAGE */}
                        {(hasExisting || hasNew) && (
                          <label className="cursor-pointer">
                            <div className="bg-gray-600 text-white px-3 py-1 rounded text-sm">
                              Change
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setImages({
                                  ...images,
                                  [key]: e.target.files[0],
                                })
                              }
                            />
                          </label>
                        )}

                        {/* REMOVE IMAGE */}
                        {(hasExisting || hasNew) && (
                          <button
                            type="button"
                            onClick={() => {
                              setImages({ ...images, [key]: null });
                              setRemovedImages({
                                ...removedImages,
                                [key]: true,
                              });
                              setForm({ ...form, [key]: null });
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={form.is_available}
                  onChange={change}
                />
                Available
              </label>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {active === "orders" && (
          <div className="p-6 border border-white text-black bg-gray-200">
            {/* Search input */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search orders by ID, name, phone, city..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="input flex-1"
              />
              {orderSearchQuery && (
                <button
                  onClick={() => setOrderSearchQuery("")}
                  className="text-red-600 px-2"
                >
                  Clear
                </button>
              )}
            </div>

            {renderOrderSection("All Orders", orders, "No orders found.")}
          </div>
        )}

        {active === "prepaid" &&
          renderOrderSection(
            "Prepaid Orders",
            prepaidOrders,
            "No prepaid orders found."
          )}

        {active === "pending" &&
          renderOrderSection(
            "Pending Shipment Orders",
            pendingShipmentOrders,
            "No pending shipments found."
          )}

        {active === "intransit" &&
          renderOrderSection(
            "Intransit Orders",
            intransitOrders,
            "No intransit orders found."
          )}

        {active === "delivered" &&
          renderOrderSection(
            "Delivered Orders",
            deliveredOrders,
            "No delivered orders found."
          )}

        {active === "out-of-stock" && (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4 text-red-600">
              Out of Stock Products
            </h1>

            {outOfStockProducts.length === 0 ? (
              <p className="text-gray-500">No out-of-stock products 🎉</p>
            ) : (
              <div className="space-y-4">
                {outOfStockProducts.map((p) => (
                  <div
                    key={p.slug}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={p.image1}
                            alt={p.title}
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {p.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 capitalize">
                                {p.product_category}
                              </p>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-black text-white capitalize">
                                {p.age_category.replace(/_/g, " ")}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => openEdit(p)}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => remove(p.slug)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Product Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* Pricing */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Price
                              </p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                  ₹{p.price}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{p.mrp}
                                </span>
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  {calculateDiscount(p.mrp, p.price)}% OFF
                                </span>
                              </div>
                            </div>

                            {/* Stock */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Stock
                              </p>
                              <p className="text-sm font-medium">
                                <span className="text-gray-900">
                                  {p.available_stock}
                                </span>
                                <span className="text-gray-400">
                                  {" "}
                                  / {p.stock_qty}
                                </span>
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    p.available_stock / p.stock_qty > 0.5
                                      ? "bg-green-500"
                                      : p.available_stock / p.stock_qty > 0.2
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${
                                      (p.available_stock / p.stock_qty) * 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Material & Fit */}
                            <div className="space-y-1.5">
                              <p className="text-sm font-medium text-gray-900">
                                Material: {p.material_type}
                              </p>
                              <p className="text-xs text-gray-600">
                                Fit: {p.fit_type}
                              </p>
                              <p className="text-xs text-gray-600">
                                Age limit: {p.age_limits || "N/A"}
                              </p>
                            </div>

                            {/* Delivery */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Delivery Charge
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                ₹{p.delivery_charge}
                              </p>
                            </div>
                          </div>

                          {/* Additional Details Row */}
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Pattern:</span>
                              <span className="font-medium text-gray-700">
                                {p.pattern_design}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Sizes:</span>
                              <div className="flex gap-1">
                                {p.available_sizes.map((size) => (
                                  <span
                                    key={size}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Rating:</span>
                              <span className="font-medium text-gray-700">
                                {p.average_rating > 0
                                  ? `${p.average_rating}/5`
                                  : "No ratings"}
                                {p.rating_count > 0 && (
                                  <span className="text-gray-400 ml-1">
                                    ({p.rating_count})
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Added:</span>
                              <span className="font-medium text-gray-700">
                                {formatDate(p.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  p.is_available
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {p.is_available ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {active === "available" && (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4 text-yellow-600">
              Available Products
            </h1>

            {availableProducts.length === 0 ? (
              <p className="text-gray-500">No available products</p>
            ) : (
              <div className="space-y-4">
                {availableProducts.map((p) => (
                  <div
                    key={p.slug}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={p.image1}
                            alt={p.title}
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {p.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 capitalize">
                                {p.product_category}
                              </p>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-black text-white capitalize">
                                {p.age_category.replace(/_/g, " ")}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => openEdit(p)}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => remove(p.slug)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Product Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* Pricing */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Price
                              </p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                  ₹{p.price}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{p.mrp}
                                </span>
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  {calculateDiscount(p.mrp, p.price)}% OFF
                                </span>
                              </div>
                            </div>

                            {/* Stock */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Stock
                              </p>
                              <p className="text-sm font-medium">
                                <span className="text-gray-900">
                                  {p.available_stock}
                                </span>
                                <span className="text-gray-400">
                                  {" "}
                                  / {p.stock_qty}
                                </span>
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    p.available_stock / p.stock_qty > 0.5
                                      ? "bg-green-500"
                                      : p.available_stock / p.stock_qty > 0.2
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${
                                      (p.available_stock / p.stock_qty) * 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Material & Fit */}
                            <div className="space-y-1.5">
                              <p className="text-sm font-medium text-gray-900">
                                Material: {p.material_type}
                              </p>
                              <p className="text-xs text-gray-600">
                                Fit: {p.fit_type}
                              </p>
                              <p className="text-xs text-gray-600">
                                Age limit: {p.age_limits || "N/A"}
                              </p>
                            </div>

                            {/* Delivery */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Delivery Charge
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                ₹{p.delivery_charge}
                              </p>
                            </div>
                          </div>

                          {/* Additional Details Row */}
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Pattern:</span>
                              <span className="font-medium text-gray-700">
                                {p.pattern_design}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Sizes:</span>
                              <div className="flex gap-1">
                                {p.available_sizes.map((size) => (
                                  <span
                                    key={size}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Rating:</span>
                              <span className="font-medium text-gray-700">
                                {p.average_rating > 0
                                  ? `${p.average_rating}/5`
                                  : "No ratings"}
                                {p.rating_count > 0 && (
                                  <span className="text-gray-400 ml-1">
                                    ({p.rating_count})
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Added:</span>
                              <span className="font-medium text-gray-700">
                                {formatDate(p.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  p.is_available
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {p.is_available ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {active === "unavailable" && (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4 text-red-600">
              Unavailable Products
            </h1>

            {unAvailableProducts.length === 0 ? (
              <p className="text-gray-500">No unavailable products</p>
            ) : (
              <div className="space-y-4">
                {unAvailableProducts.map((p) => (
                  <div
                    key={p.slug}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={p.image1}
                            alt={p.title}
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {p.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 capitalize">
                                {p.product_category}
                              </p>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-black text-white capitalize">
                                {p.age_category.replace(/_/g, " ")}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => openEdit(p)}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => remove(p.slug)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Product Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* Pricing */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Price
                              </p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                  ₹{p.price}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{p.mrp}
                                </span>
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  {calculateDiscount(p.mrp, p.price)}% OFF
                                </span>
                              </div>
                            </div>

                            {/* Stock */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Stock
                              </p>
                              <p className="text-sm font-medium">
                                <span className="text-gray-900">
                                  {p.available_stock}
                                </span>
                                <span className="text-gray-400">
                                  {" "}
                                  / {p.stock_qty}
                                </span>
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    p.available_stock / p.stock_qty > 0.5
                                      ? "bg-green-500"
                                      : p.available_stock / p.stock_qty > 0.2
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${
                                      (p.available_stock / p.stock_qty) * 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Material & Fit */}
                            <div className="space-y-1.5">
                              <p className="text-sm font-medium text-gray-900">
                                Material: {p.material_type}
                              </p>
                              <p className="text-xs text-gray-600">
                                Fit: {p.fit_type}
                              </p>
                              <p className="text-xs text-gray-600">
                                Age limit: {p.age_limits || "N/A"}
                              </p>
                            </div>

                            {/* Delivery */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Delivery Charge
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                ₹{p.delivery_charge}
                              </p>
                            </div>
                          </div>

                          {/* Additional Details Row */}
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Pattern:</span>
                              <span className="font-medium text-gray-700">
                                {p.pattern_design}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Sizes:</span>
                              <div className="flex gap-1">
                                {p.available_sizes.map((size) => (
                                  <span
                                    key={size}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Rating:</span>
                              <span className="font-medium text-gray-700">
                                {p.average_rating > 0
                                  ? `${p.average_rating}/5`
                                  : "No ratings"}
                                {p.rating_count > 0 && (
                                  <span className="text-gray-400 ml-1">
                                    ({p.rating_count})
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Added:</span>
                              <span className="font-medium text-gray-700">
                                {formatDate(p.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  p.is_available
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {p.is_available ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {active === "low-stock" && (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4 text-yellow-600">
              Low Stock Products (≤ 5)
            </h1>

            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500">No low stock products 👍</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.slug}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={p.image1}
                            alt={p.title}
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {p.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 capitalize">
                                {p.product_category}
                              </p>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-black text-white capitalize">
                                {p.age_category.replace(/_/g, " ")}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => openEdit(p)}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => remove(p.slug)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Product Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* Pricing */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Price
                              </p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                  ₹{p.price}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{p.mrp}
                                </span>
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  {calculateDiscount(p.mrp, p.price)}% OFF
                                </span>
                              </div>
                            </div>

                            {/* Stock */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Stock
                              </p>
                              <p className="text-sm font-medium">
                                <span className="text-gray-900">
                                  {p.available_stock}
                                </span>
                                <span className="text-gray-400">
                                  {" "}
                                  / {p.stock_qty}
                                </span>
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    p.available_stock / p.stock_qty > 0.5
                                      ? "bg-green-500"
                                      : p.available_stock / p.stock_qty > 0.2
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${
                                      (p.available_stock / p.stock_qty) * 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Material & Fit */}
                            <div className="space-y-1.5">
                              <p className="text-sm font-medium text-gray-900">
                                Material: {p.material_type}
                              </p>
                              <p className="text-xs text-gray-600">
                                Fit: {p.fit_type}
                              </p>
                              <p className="text-xs text-gray-600">
                                Age limit: {p.age_limits || "N/A"}
                              </p>
                            </div>

                            {/* Delivery */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Delivery Charge
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                ₹{p.delivery_charge}
                              </p>
                            </div>
                          </div>

                          {/* Additional Details Row */}
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Pattern:</span>
                              <span className="font-medium text-gray-700">
                                {p.pattern_design}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Sizes:</span>
                              <div className="flex gap-1">
                                {p.available_sizes.map((size) => (
                                  <span
                                    key={size}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Rating:</span>
                              <span className="font-medium text-gray-700">
                                {p.average_rating > 0
                                  ? `${p.average_rating}/5`
                                  : "No ratings"}
                                {p.rating_count > 0 && (
                                  <span className="text-gray-400 ml-1">
                                    ({p.rating_count})
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Added:</span>
                              <span className="font-medium text-gray-700">
                                {formatDate(p.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  p.is_available
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {p.is_available ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
