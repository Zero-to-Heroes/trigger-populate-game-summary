/* eslint-disable @typescript-eslint/no-use-before-define */
import SqlString from 'sqlstring';
import { getConnection } from './db/rds';
import { ReviewMessage } from './review-message';
import serverlessMysql = require('serverless-mysql');

// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.
// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event): Promise<any> => {
	// console.log('event', JSON.stringify(event));
	const messages: readonly ReviewMessage[] = event.Records.map(record => record.Sns.Message).map(msg =>
		JSON.parse(msg),
	);
	const mysql = await getConnection();
	await Promise.all(messages.map(message => uploadStats(message, mysql)));
	// console.log('built stats', JSON.stringify(stats));
	return { statusCode: 200, body: '' };
};

const uploadStats = async (message: ReviewMessage, mysql: serverlessMysql.ServerlessMysql): Promise<boolean> => {
	const escape = SqlString.escape;
	const query = `
		INSERT INTO replay_summary
		(
			coinPlay,
			opponentClass,
			opponentDecklist,
			opponentHero,
			opponentName,
			opponentRank,
			playerClass,
			playerDecklist,
			playerHero,
			playerName,
			playerRank,
			result,
			reviewId,
			gameMode,
			creationDate,
			userId,
			gameFormat,
			opponentCardId,
			playerCardId,
			uploaderToken,
			buildNumber,
			playerDeckName,
			scenarioId,
			additionalResult
		)
		VALUES (
			${escape(message.coinPlay)},
			${escape(message.opponentClass)},
			${escape(message.opponentDecklist)},
			${escape(message.opponentHero)},
			${escape(message.opponentName)},
			${escape(message.opponentRank)},
			${escape(message.playerClass)},
			${escape(message.playerDecklist)},
			${escape(message.playerHero)},
			${escape(message.playerName)},
			${escape(message.playerRank)},
			${escape(message.result)},
			${escape(message.reviewId)},
			${escape(message.gameMode)},
			${escape(message.creationDate)},
			${escape(message.userId)},
			${escape(message.gameFormat)},
			${escape(message.opponentCardId)},
			${escape(message.playerCardId)},
			${escape(message.uploaderToken)},
			${escape(message.buildNumber)},
			${escape(message.playerDeckName)},
			${escape(message.scenarioId)},
			${escape(message.additionalResult)}
		)
	`;
	console.log('running query', query);
	const result = await mysql.query(query);
	console.log('result', result);
	return true;
};
