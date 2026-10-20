
import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";

const backend = defineBackend({
  auth,
  data,
});

const bedrockDataSource =
  backend.data.resources.graphqlApi.addHttpDataSource(
    "bedrockDS",
    "https://bedrock-runtime.us-west-2.amazonaws.com",
    {
      authorizationConfig: {
        signingRegion: "us-west-2",
        signingServiceName: "bedrock",
      },
    }
  );

// Grant permission to invoke Amazon Nova Micro
// through the US cross-Region inference profile.
bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: [
      // US inference profile
      "arn:aws:bedrock:us-west-2:096610237546:inference-profile/us.amazon.nova-micro-v1:0",

      // Underlying Nova Micro foundation models
      "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-micro-v1:0",
      "arn:aws:bedrock:us-east-2::foundation-model/amazon.nova-micro-v1:0",
      "arn:aws:bedrock:us-west-2::foundation-model/amazon.nova-micro-v1:0",
    ],
  })
);
