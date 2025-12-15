import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as core from 'aws-cdk-lib/core';
import * as cr from 'aws-cdk-lib/custom-resources';
import { execSync } from 'child_process';
import type * as sst from 'sst/constructs';

import { getDeployData, rc4_encrypt } from './util';

const sitePath = 'packages/ts/web';
let destinationPath = 'saas_arqgen_layouts';

export const FrontendFolder = async ({ stack }: sst.StackContext) => {
    if (process.env.TAG_NUMBER)
        destinationPath = destinationPath + '/' + (await rc4_encrypt(process.env.TAG_NUMBER));
    const { cloudfrontDistributionId, s3Arn } = await getDeployData(stack);
    if (!cloudfrontDistributionId || !s3Arn) {
        throw new Error('Missing cloudfrontArn or s3Arn');
    }

    const deployBucket = s3.Bucket.fromBucketArn(stack, 'IBucket', s3Arn);

    processBuild();
    deployS3(stack, deployBucket);
    invalidateCache(stack, cloudfrontDistributionId);

    stack.addOutputs({
        destinationPath,
    });

    return { cloudfrontDistributionId, s3Arn };
};

function processBuild() {
    execSync('npm install', {
        cwd: sitePath,
        stdio: 'inherit',
    });
    execSync('npm run build', {
        cwd: sitePath,
        stdio: 'inherit',
    });
}
function deployS3(stack: sst.Stack, deployBucket: s3.IBucket) {
    new s3deploy.BucketDeployment(stack, 'DeployWebsite1', {
        sources: [s3deploy.Source.asset(sitePath + '/dist/', { exclude: ['index.html'] })],
        destinationBucket: deployBucket,
        destinationKeyPrefix: `${destinationPath}/`, // optional prefix in destination bucket
        prune: false,
        cacheControl: [
            s3deploy.CacheControl.maxAge(core.Duration.days(365)),
            s3deploy.CacheControl.immutable(),
        ],
    });
    new s3deploy.BucketDeployment(stack, 'DeployWebsite2', {
        sources: [
            s3deploy.Source.asset(sitePath + '/dist/', {
                exclude: ['*', '!index.html'],
            }),
        ],
        destinationBucket: deployBucket,
        destinationKeyPrefix: `${destinationPath}/`, // optional prefix in destination bucket
        prune: false,
        cacheControl: [s3deploy.CacheControl.maxAge(core.Duration.days(0))],
    });
}

function invalidateCache(stack: sst.Stack, cloudfrontDistributionId: string) {
    new cr.AwsCustomResource(stack, `CloudFrontInvalidation-${Date.now()}`, {
        onCreate: {
            physicalResourceId: cr.PhysicalResourceId.of(
                `${cloudfrontDistributionId}-${Date.now()}`
            ),
            service: 'CloudFront',
            action: 'createInvalidation',
            parameters: {
                DistributionId: cloudfrontDistributionId,
                InvalidationBatch: {
                    CallerReference: Date.now().toString(),
                    Paths: {
                        Quantity: 1,
                        Items: [`/${destinationPath}/*`],
                    },
                },
            },
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
            resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
    });
}
