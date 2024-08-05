import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.DEFAULT_REGION!,
  credentials: {
    accessKeyId: process.env.ENV_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ENV_AWS_SECRET_ACCESS_KEY!
  }
});

export const sendEmail = async ({
  to,
  subject,
  body
}: {
  to: string;
  subject: string;
  body: string;
}) => {
  const params = {
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Html: { Data: body }
      },
      Subject: { Data: subject }
    },
    Source: "orders@artistcollective.store" // Replace with your verified sender email address
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
  } catch (err) {
    console.error(err);
  }
};
