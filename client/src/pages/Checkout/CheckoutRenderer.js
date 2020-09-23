import React, { Component } from "react";
import CheckoutPage from "./Checkout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_live_51HT5a3Bfsl1QGy9mpy7klCujcGxlWppVPS4mn1nMiyh3oqRAEkKyKLaiIt0vyTK5foij94KzIIVGdu79dJhzYWSR00NBhWtzqk"
);

class Checkout extends Component {
  render() {
    return (
      <Elements stripe={stripePromise}>
        <CheckoutPage />
      </Elements>
    );
  }
}

export default Checkout;
