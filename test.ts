import { reviewModerationGraph } from "./src/graph/index.js";

async function runTests() {
    console.log("=== TEST 1: Text Only (Should route to Text Worker only) ===");
    await reviewModerationGraph.invoke({
        reviewPayload: { text: "Great product!", rating: 5 }
    });

    console.log("\n=== TEST 2: Text + Image + Missing Rating (Should route to all 3) ===");
    await reviewModerationGraph.invoke({
        reviewPayload: { text: "Looks okay.", imageUrl: "http://example.com/pic.jpg" }
    });
}

runTests().catch(console.error);