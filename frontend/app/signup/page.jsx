"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://127.0.0.1:8000/api/signup/", form);
      alert("Signup successful!");
      router.push("/login")
    } catch (err) {
      console.log(err);
      alert("Signup failed!");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} />
        <br />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <br />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}
