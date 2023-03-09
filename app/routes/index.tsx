import {Configuration, OpenAIApi} from 'openai';
import {useRef, useEffect} from 'react';

import {json} from '@remix-run/node';
import type {ActionArgs, ErrorBoundaryComponent} from '@remix-run/node';
import {Form, useActionData, useNavigation, Link} from '@remix-run/react';
import punSetup from '~/utils/punSetup';


export function meta() {
  return {
    charset: "utf-8",
    title: "GPT pun generator",
    description: "Generate puns using GPT-3.5-turbo",
    viewport: "width=device-width,initial-scale=1",
  };
}

export async function action({request}: ActionArgs) {
  const body = await request.formData();

  const conf = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(conf);

  const chat = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      ...punSetup,
      {
        role: 'user',
        content: body.get('message') as string,
      },
    ]
  });

  const answer = chat.data.choices[0].message?.content;

  return {
    message: body.get('message'),
    answer,
  };
}

export default function IndexPage() {
  const data = useActionData<typeof action>();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (navigation.state === 'submitting') {
      inputRef.current.value = '';
    }
  }, [navigation.state])

  return (
    <main className="container">
      <h1>GPT pun generator</h1>
      <p>Enter a word you want to hear a pun about!</p>
      {isSubmitting && (
        <div className="answer">
          <p>Thinking...</p>
        </div>
      )}
      {!isSubmitting && data?.answer && (
        <div className="answer">
          <p>{data?.answer}</p>
        </div>
      )}
      <Form method="post">
        <div className="input-wrap">
          <input ref={inputRef} type="text" name="message" placeholder="Cats" minLength={2} required />
          <button type="submit" disabled={isSubmitting} aria-disabled={isSubmitting}>Submit</button>
        </div>
      </Form>
    </main>
  );
}

// Todo: get propper type
export function ErrorBoundary({error}: any) {
  return (
    <main className="container">
      <h1>Oops. You broke something, way to go!</h1>
      <p className="error">{error.message}</p>
      <p>Back to <Link to="/">chat</Link></p>
    </main>
  );
}