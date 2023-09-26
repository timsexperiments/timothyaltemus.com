import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  render,
} from "@react-email/components";

const SUBJECT = "🚀 Tim's Experiments Launch Coming Soon!" as const;

type SubscriptionEmailProps = {
  email: string;
};

const SubscriptionEmail = ({
  email = "hello@example.com",
}: SubscriptionEmailProps) => {
  return (
    <Tailwind
      config={{
        darkMode: "media",
        theme: {
          extend: {
            fontFamily: {
              primary: ["Urbanist", "Arial", "Helvetica", "sans-serif"],
              secondary: [
                "Lato",
                "Gill Sans",
                "Gill Sans MT",
                "Calibri",
                "Trebuchet MS",
                "sans-serif",
              ],
              mono: [
                "JetBrains Mono",
                "Menlo",
                "Monaco",
                "Consolas",
                "Courier New",
                "monospace",
              ],
            },
            colors: {
              // Primary
              "teal-vivid-50": "#F0FCF9",
              "teal-vivid-100": "#C6F7E9",
              "teal-vivid-200": "#8EEDD1",
              "teal-vivid-300": "#5FE3C0",
              "teal-vivid-400": "#2DCCA7",
              "teal-vivid-500": "#17B897",
              "teal-vivid-600": "#079A82",
              "teal-vivid-700": "#048271",
              "teal-vivid-800": "#016457",
              "teal-vivid-900": "#004440",

              // Neutrals
              "grey-50": "#F7F7F7",
              "grey-100": "#E1E1E1",
              "grey-200": "#CFCFCF",
              "grey-300": "#B1B1B1",
              "grey-400": "#9E9E9E",
              "grey-500": "#7E7E7E",
              "grey-600": "#626262",
              "grey-700": "#515151",
              "grey-800": "#3B3B3B",
              "grey-900": "#222222",

              // Supporting
              "yellow-vivid-50": "#FFFBEA",
              "yellow-vivid-100": "#FFF3C4",
              "yellow-vivid-200": "#FCE588",
              "yellow-vivid-300": "#FADB5F",
              "yellow-vivid-400": "#F7C948",
              "yellow-vivid-500": "#F0B429",
              "yellow-vivid-600": "#DE911D",
              "yellow-vivid-700": "#CB6E17",
              "yellow-vivid-800": "#B44D12",
              "yellow-vivid-900": "#8D2B0B",

              "red-vivid-50": "#FFE3E3",
              "red-vivid-100": "#FFBDBD",
              "red-vivid-200": "#FF9B9B",
              "red-vivid-300": "#F86A6A",
              "red-vivid-400": "#EF4E4E",
              "red-vivid-500": "#E12D39",
              "red-vivid-600": "#CF1124",
              "red-vivid-700": "#AB091E",
              "red-vivid-800": "#8A041A",
              "red-vivid-900": "#610316",
            },
          },
        },
      }}
    >
      <Html lang="en">
        <Head>
          <title></title>
          <link
            href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <Preview>
          Prepare for a journey of curiosity and discovery with Tim's
          Experiments!
        </Preview>
        <Body className="mx-auto my-auto bg-white font-secondary text-grey-900 dark:bg-grey-900 dark:text-grey-50">
          <Container className="w-[465px]">
            <Section className="mb-4 mt-24 flex justify-center">
              <Img
                className="h-8"
                src="https://cdn.timsexperiments.foo/tim_s_experiments_logo_light.svg"
                alt="Tim's Experiments"
              />
            </Section>
            <Text>Hi {email}</Text>

            <Text>
              You're subscribed to Tim's Experiments updates! We'll notify you
              via email when the site launches. Get ready for exciting
              discoveries!
            </Text>

            <Text>
              See you soon,
              <br />
              Tim
            </Text>

            <Text className="text-xs">
              Tired of hearing from us?
              <Link
                href={`https://waitlist.timothyaltemus.com/unsubscribe?email=${email}`}
              >
                {" "}
                Unsubscribe
              </Link>
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export const subscriptionEmail = (email: string) => ({
  subject: SUBJECT,
  html: render(<SubscriptionEmail email={email} />, { pretty: true }),
  text: render(<SubscriptionEmail email={email} />, { plainText: true }),
});
