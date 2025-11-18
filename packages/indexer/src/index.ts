import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { StreamsIndexer } from './services/StreamsIndexer';
import { logger } from './utils/logger';
import { DBService } from './services/DbService';
import crypto from 'crypto';
import { USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { GenesisPriceUpdater } from './services/GenesisPriceUpdater';

dotenv.config();

enum IndexerType {
    STREAMS = 'streams',
}

const { POSTGRES_URI, RPC_URL, RPC_CHAIN_ID, WEBHOOK_PORT, INDEXER_TYPE, QUICKNODE_SECURITY_TOKEN, PRICE_UPDATER_PRIVATE_KEY } = process.env;
const MANAGER_ADDRESS = USED_CONTRACTS.VAULT_MANAGER;

let app: express.Application | null = null;
let server: any = null;

async function main() {
    const indexerType = INDEXER_TYPE ? (INDEXER_TYPE as IndexerType) : IndexerType.STREAMS;
    const webhookPort = WEBHOOK_PORT ? parseInt(WEBHOOK_PORT, 10) : 3001;

    if (!POSTGRES_URI) {
        throw new Error('POSTGRES_URI is required');
    }

    try {
        const dbService = DBService.getInstance(POSTGRES_URI);
        await dbService.setupDatabase();

        let indexer: StreamsIndexer;

        startWebhookServer(
            webhookPort,
            dbService,
            async (data: any) => {
                // Handle streams-specific webhooks if it's a streams indexer
                if (indexerType === IndexerType.STREAMS && indexer instanceof StreamsIndexer) {
                    await (indexer as StreamsIndexer).processWebhook(data);
                } else {
                    console.log('Webhook received for', indexerType, 'indexer:', data.length);
                }
            },
            async (data: any) => {
                // Handle genesis vault webhooks
                if (indexerType === IndexerType.STREAMS && indexer instanceof StreamsIndexer) {
                    await (indexer as StreamsIndexer).processGenesisWebhook(data);
                } else {
                    console.log('Genesis webhook received for', indexerType, 'indexer:', data.length);
                }
            }
        );

        if (indexerType === IndexerType.STREAMS) {
            if (!RPC_URL || !RPC_CHAIN_ID || !Number(RPC_CHAIN_ID) || !MANAGER_ADDRESS || !QUICKNODE_SECURITY_TOKEN) {
                throw new Error('RPC_URL, RPC_CHAIN_ID and RPC_MANAGER_ADDRESS are required');
            }

            indexer = new StreamsIndexer(RPC_URL, Number(RPC_CHAIN_ID), MANAGER_ADDRESS, POSTGRES_URI);
        } else {
            throw new Error('Invalid indexer type');
        }

        await indexer.start();

        // Start genesis price updater (scheduler)
        if (!RPC_URL || !PRICE_UPDATER_PRIVATE_KEY) {
            logger.warn('Skipping GenesisPriceUpdater (RPC_URL or PRICE_UPDATER_PRIVATE_KEY missing).');
        } else {
            const priceUpdater = new GenesisPriceUpdater(dbService, RPC_URL, PRICE_UPDATER_PRIVATE_KEY);
            priceUpdater.start();
        }

        // Handle graceful shutdown
        const gracefulShutdown = async () => {
            logger.info('Shutting down gracefully...');
            try {
                await indexer.stop();
                if (server) {
                    server.close(() => {
                        logger.info('HTTP server closed');
                    });
                }
            } catch (error) {
                logger.error('Error during shutdown:', error);
            }
            process.exit(0);
        };

        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
    } catch (error) {
        logger.error('Error starting indexer:', error);
        process.exit(1);
    }
}

main();

function startWebhookServer(
    port: number,
    dbService: DBService,
    callback: (data: any) => Promise<void>,
    genesisCallback: (data: any) => Promise<void>
) {
    // Set up Express server for webhooks
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Webhook endpoint for StreamsIndexer
    app.post('/webhook/logs', async (req: Request, res: Response) => {
        if (!QUICKNODE_SECURITY_TOKEN) {
            throw new Error('QUICKNODE_SECURITY_TOKEN is required');
        }

        const secretKey = QUICKNODE_SECURITY_TOKEN;
        const nonce = req.headers['x-qn-nonce'] as string;
        const timestamp = req.headers['x-qn-timestamp'] as string;
        const givenSignature = req.headers['x-qn-signature'] as string;

        if (!nonce || !timestamp || !givenSignature) {
            console.error('Missing required headers');
            return res.status(400).send('Missing required headers');
        }

        try {
            const payloadString = JSON.stringify(req.body);
            const isValid = verifySignature(secretKey, payloadString, nonce, timestamp, givenSignature);

            if (isValid) {
                console.log('\n✅ Signature verified successfully');
            } else {
                console.log('\n❌ Signature verification failed');
                return res.status(401).send('Invalid signature');
            }

            // Process webhook data with StreamsIndexer
            await callback(req.body);

            res.status(200).json({ success: true, message: 'Webhook processed successfully' });
        } catch (error) {
            logger.error('Error processing webhook:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing webhook',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // Webhook endpoint for GenesisVault events
    app.post('/webhook/genesis-logs', async (req: Request, res: Response) => {
        if (!QUICKNODE_SECURITY_TOKEN) {
            throw new Error('QUICKNODE_SECURITY_TOKEN is required');
        }

        const secretKey = QUICKNODE_SECURITY_TOKEN;
        const nonce = req.headers['x-qn-nonce'] as string;
        const timestamp = req.headers['x-qn-timestamp'] as string;
        const givenSignature = req.headers['x-qn-signature'] as string;

        if (!nonce || !timestamp || !givenSignature) {
            console.error('Missing required headers');
            return res.status(400).send('Missing required headers');
        }

        try {
            const payloadString = JSON.stringify(req.body);
            const isValid = verifySignature(secretKey, payloadString, nonce, timestamp, givenSignature);

            if (isValid) {
                console.log('\n✅ Signature verified successfully');
            } else {
                console.log('\n❌ Signature verification failed');
                return res.status(401).send('Invalid signature');
            }

            // Process webhook data with StreamsIndexer genesis handler
            await genesisCallback(req.body);

            res.status(200).json({ success: true, message: 'Genesis webhook processed successfully' });
        } catch (error) {
            logger.error('Error processing genesis webhook:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing genesis webhook',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    // Start HTTP server
    server = app.listen(port, '0.0.0.0', () => {
        logger.info(`Webhook server listening on port ${port}`);
    });
}

function verifySignature(secretKey: string, payload: string, nonce: string, timestamp: string, givenSignature: string) {
    // First concatenate as strings
    const signatureData = nonce + timestamp + payload;

    // Convert to bytes
    const signatureBytes = Buffer.from(signatureData);

    // Create HMAC with secret key converted to bytes
    const hmac = crypto.createHmac('sha256', Buffer.from(secretKey));
    hmac.update(signatureBytes);
    const computedSignature = hmac.digest('hex');

    const valid = crypto.timingSafeEqual(Buffer.from(computedSignature, 'hex'), Buffer.from(givenSignature, 'hex'));

    if (!valid) {
        console.log('\nSignature Debug:');
        console.log('Message components:');
        console.log('- Nonce:', nonce);
        console.log('- Timestamp:', timestamp);
        console.log('- Payload first 100 chars:', payload.substring(0, 100));
        console.log('\nSignatures:');
        console.log('- Computed:', computedSignature);
        console.log('- Given:', givenSignature);
    }

    return valid;
}
