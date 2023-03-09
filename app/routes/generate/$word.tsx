import {Configuration, OpenAIApi} from 'openai';
import {useRef, useEffect} from 'react';

import {json} from '@remix-run/node';
import type {ActionArgs, LoaderArgs} from '@remix-run/node';
import {Form, useActionData, useNavigation, Link} from '@remix-run/react';
import punSetup from '~/utils/punSetup';


export const loader = async ({params}: LoaderArgs) => {

  const conf = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(conf);

  try {
    const chat = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        ...punSetup,
        {
          role: 'user',
          content: params.word as string,
        },
      ]
    });

    const answer = chat.data.choices[0].message?.content;

    return json({
      response: answer,
    });

  } catch (error: any) {
    return json({error: error.message});
  }
};