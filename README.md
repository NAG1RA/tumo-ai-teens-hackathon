# TUMO AI / Teens Hackathon Project Template

🤖 This is the project template for the TUMO AI / Teens Hackathon 2025. 

It is based on the [Vercel Next-OpenAI](https://github.com/vercel/ai/tree/main/examples/next-openai) example project.

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init):

```bash
npx create-next-app --example https://github.com/tom-auger/ai-teens-hackathon/tree/main/ tumo-ai-teens-hackathon
```

To run the example locally you need to:

1. Sign up at [OpenAI's Developer Platform](https://platform.openai.com/signup).
2. Go to [OpenAI's dashboard](https://platform.openai.com/account/api-keys) and create an API KEY.
3. Set the required environment variable as the token value as shown [the example env file](./.env.local.example) but in a new file called `.env.local`
4. `npx install` to install the required dependencies.
5. `npx dev` to launch the development server.

## Deploy to Vercel

Deploy to vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub%2Ecom%2Ftom%2Dauger%2Fai%2Dteens%2Dhackathon&env=OPENAI_API_KEY&project-name=tumo-ai-teens-hackathon&repository-name=tumo-ai-teens-hackathon)