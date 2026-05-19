import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";

/**
 * Trust Check Example
 *
 * Demonstrates using the onBeforePaymentCreation hook to verify
 * service trust before sending payment. The agent calls a trust
 * check endpoint and aborts if the score is below threshold.
 *
 * This pattern protects agents from paying untrusted services
 * by adding a pre-flight check to the existing payment lifecycle.
 *
 * @param evmPrivateKey - The EVM private key for signing
 * @param url - The URL to make the request to
 */
export async function runTrustCheckExample(
  evmPrivateKey: `0x${string}`,
  url: string,
): Promise<void> {
  console.log("🔍 Creating client with pre-payment trust verification...\n");

  const TRUST_CHECK_URL = "https://supership.crestsystems.ai/check";
  const TRUST_THRESHOLD = 50;

  const evmSigner = privateKeyToAccount(evmPrivateKey);

  const client = new x402Client()
    .register("eip155:*", new ExactEvmScheme(evmSigner))
    .onBeforePaymentCreation(async (context) => {
      // Extract the service origin from the payment context
      const serviceUrl = context.resourceUrl
        ? new URL(context.resourceUrl).origin
        : null;

      if (!serviceUrl) return;

      try {
        const res = await fetch(
          `${TRUST_CHECK_URL}?url=${encodeURIComponent(serviceUrl)}`,
        );
        const trust = await res.json();

        console.log(
          `   Trust: ${trust.score}/100 (${trust.grade}) — ${trust.recommendation}`,
        );

        if (trust.confidence_debt?.length > 0) {
          console.log(
            `   Confidence debt: ${trust.confidence_debt.join(", ")}`,
          );
        }

        if (trust.score < TRUST_THRESHOLD) {
          console.log(
            `   ⛔ Score ${trust.score} below threshold ${TRUST_THRESHOLD}. Aborting payment.`,
          );
          return {
            abort: true,
            reason: `Trust score ${trust.score}/${trust.grade} below threshold. ${trust.recommendation}`,
          };
        }

        console.log("   ✅ Trust check passed. Proceeding with payment.\n");
      } catch {
        console.log(
          "   ⚠️ Trust check unavailable. Proceeding with caution.\n",
        );
      }
    });

  const { wrapFetchWithPayment } = await import("@x402/fetch");
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  console.log(`🌐 Making trust-verified request to: ${url}\n`);
  const response = await fetchWithPayment(url, { method: "GET" });
  const body = await response.json();

  console.log("✅ Request completed with trust verification\n");
  console.log("Response body:", body);
}
