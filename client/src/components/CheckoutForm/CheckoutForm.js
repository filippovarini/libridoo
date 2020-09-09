import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import "./CheckoutForm.css";

import CardSection from "../../components/CardSection/CardSection";

export default function CheckoutForm(props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorDisplay, setErrorDisplay] = useState(null);

  const handleSubmit = async event => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();
    if (!sessionStorage.getItem("client_secret") || !stripe || !elements) {
      setErrorDisplay(
        "Qualcosa è andato storto nel setup del pagamento. Non ti preoccupare, non hai perso soldi. Ricarica la pagina e prova di nuovo. Se il problema persiste, non esitare a contattarci"
      );
      setTimeout(() => setErrorDisplay(null), 6000);
    } else {
      setLoading(true);
      const result = await stripe.confirmCardPayment(
        sessionStorage.getItem("client_secret"),
        {
          payment_method: {
            card: elements.getElement(CardElement)
            // billing_details: {
            //   name: this.props.name
            // }
          }
        }
      );

      if (result.error) {
        // Show error to your customer (e.g., insufficient funds)
        console.log(result.error.message);
        setLoading(false);
        setErrorDisplay(result.error.message);
        setTimeout(() => setErrorDisplay(null), 3000);
      } else {
        // The payment has been processed!
        if (result.paymentIntent.status === "succeeded") {
          console.log("success");
          console.log(result);
          // setLoading(false);
          props.savePurchase(
            props.totalBookPrice,
            props.totalDeliveryPrice,
            props.discountAvailable,
            props.totalPrice
          );
          // Show a success message to your customer
        }
      }
    }
  };

  return (
    <form id="ck-form" onSubmit={handleSubmit}>
      <CardSection />
      <button id="ck-form-confirm" disabled={!stripe || loading}>
        {!loading ? "PAGA" : "loading, non chiudere la pagina..."}
        {/* Cane2012 */}
      </button>
      <p id="ckf-error">{errorDisplay}</p>
      <input type="submit" className="hidden" />
    </form>
  );
}
