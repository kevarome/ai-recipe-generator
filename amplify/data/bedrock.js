
import { util } from "@aws-appsync/utils";

// Send a request to Amazon Bedrock
export function request(ctx) {
  const { ingredients = [] } = ctx.args;

  // Construct the prompt using the provided ingredients
  const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}. Include a recipe name, ingredients, and step-by-step cooking instructions.`;

  return {
    resourcePath: "/model/us.amazon.nova-micro-v1:0/invoke",
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              {
                text: prompt,
              },
            ],
          },
        ],
        inferenceConfig: {
          maxTokens: 1000,
          temperature: 0.7,
        },
      }),
    },
  };
}

// Process the response from Amazon Bedrock
export function response(ctx) {
  // Handle AWS AppSync errors
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  // Parse the response body
  const parsedBody = JSON.parse(ctx.result.body);

  // Handle errors returned by Amazon Bedrock
  if (
    parsedBody.Message ||
    (parsedBody.message && !parsedBody.output)
  ) {
    util.error(
      parsedBody.Message || parsedBody.message,
      "BedrockError"
    );
  }

  // Extract the generated recipe text
  const recipe =
    parsedBody.output?.message?.content?.[0]?.text;

  // Return the recipe to the React application
  return {
    body: recipe || "No recipe was generated.",
  };
}
