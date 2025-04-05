import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

export class FrontEndStack extends cdk.Stack {
    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // S3 bucket for hosting the static website
        const websiteBucket = new s3.Bucket(this, 'CryptoWebsiteBucket', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: '404.html',
            publicReadAccess: true,
            blockPublicAccess: new s3.BlockPublicAccess({
                blockPublicPolicy: false,
            }),
        });

        // CloudFront distribution for the S3 bucket
        this.distribution = new cloudfront.Distribution(this, 'CryptoDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(websiteBucket, {
                    originPath: '/',
                }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: 'index.html',
        });

        // Deploy the front-end files to the S3 bucket
        new BucketDeployment(this, 'CryptoBucketDeployment', {
            sources: [Source.asset('../front-end/dist')],
            destinationBucket: websiteBucket,
            distribution: this.distribution,
            distributionPaths: ['/*'],
        });
    }
}
