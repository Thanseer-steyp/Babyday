"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import OrderCard from "../../components/includes/OrderCard";

const TABS = [
  { key: "products", label: "Products" },
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

  const authHeader = {
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  };

  const loadMe = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/me/", {
        headers: authHeader,
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

  // 👇 define it OUTSIDE useEffect
  const loadProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/manager/products/",
        { headers: authHeader }
      );
      setProducts(res.data);
      console.log(res.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const loadOrders = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/all-orders/",
      { headers: authHeader }
    );
    setOrders(res.data);
  };

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
      { headers: authHeader }
    );
    setPrepaidOrders(res.data);
  };

  const loadPendingShipmentOrders = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/orders/pending-shipments/",
      { headers: authHeader }
    );
    setPendingShipmentOrders(res.data);
  };

  const loadIntransitOrders = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/orders/intransit/",
      { headers: authHeader }
    );
    setIntransitOrders(res.data);
  };

  const loadDeliveredOrders = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/v1/manager/orders/delivered/",
      { headers: authHeader }
    );
    setDeliveredOrders(res.data);
  };

  useEffect(() => {
    loadProducts();
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
              <button
                onClick={openCreate}
                className="bg-white text-black px-4 py-2 rounded w-max"
              >
                + Add Product
              </button>
            </div>

            {/* LIST */}
            <div className="space-y-3">
              {products.map((p) => (
                <div
                  key={p.slug}
                  className="bg-white p-4 rounded shadow flex justify-between"
                >
                  <div className="flex gap-2">
                    <div className="w-12">
                      <img src={p.image1} alt="" className="w-full block" />
                    </div>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-gray-500">
                        {p.product_category}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p.slug)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL */}
            {open && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
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
          </div>
        )}



        {active === "orders" &&
          renderOrderSection("All Orders", orders, "No orders found.")}

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
      </div>
    </div>
  );
}
