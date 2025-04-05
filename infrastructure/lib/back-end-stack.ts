import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3_assets from 'aws-cdk-lib/aws-s3-assets';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';

export class BackEndStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const ecrRepository = new ecr.Repository(this, 'SpringCryptoAppRepository', {
            repositoryName: 'spring-crypto-app',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });


        // Upload local code to S3
        const codeAsset = new s3_assets.Asset(this, 'CodeAsset', {
            path: '../back-end-kotlin', // Path to the directory containing your code and Dockerfile
        });

        // Create an IAM role for CodeBuild
        const codeBuildRole = new iam.Role(this, 'CodeBuildRole', {
            assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
        });


        // Grant CodeBuild permissions to access the S3 asset
        codeAsset.grantRead(codeBuildRole);

        // Grant CodeBuild permissions to work with ECR
        ecrRepository.grantPullPush(codeBuildRole);


        // Create a CodeBuild project
        const codeBuildProject = new codebuild.Project(this, 'SpringCryptoAppBuildProject', {
            role: codeBuildRole,
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_6_0, // Use a standard build image
                privileged: true, // Required for Docker builds
            },
            source: codebuild.Source.s3({
                bucket: codeAsset.bucket,
                path: codeAsset.s3ObjectKey,
            }),
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    pre_build: {
                        commands: [
                            'echo Logging in to Amazon ECR...',
                            'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_URI',
                        ],
                    },
                    build: {
                        commands: [
                            'echo Building Docker image...',
                            'docker build -t $ECR_REPOSITORY_URI:latest .',
                            'echo Tagging Docker image...',
                            'docker tag $ECR_REPOSITORY_URI:latest $ECR_REPOSITORY_URI:$IMAGE_TAG',
                        ],
                    },
                    post_build: {
                        commands: [
                            'echo Pushing Docker image to ECR...',
                            'docker push $ECR_REPOSITORY_URI:$IMAGE_TAG',
                        ],
                    },
                },
                env: {
                    variables: {
                        ECR_REPOSITORY_URI: ecrRepository.repositoryUri,
                        IMAGE_TAG: 'latest', // You can use a dynamic tag (e.g., Git commit hash)
                    },
                },
            }),
        });

        // Create an IAM role for App Runner
        const appRunnerRole = new iam.Role(this, 'AppRunnerAccessRole', {
            assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
        });

        // Grant App Runner permissions to pull images from ECR
        ecrRepository.grantPull(appRunnerRole);

        // Create an App Runner service
        const appRunnerService = new apprunner.CfnService(this, 'SpringCryptoAppRunnerService', {
            serviceName: 'spring-crypto-app-runner',
            sourceConfiguration: {
                authenticationConfiguration: {
                    accessRoleArn: appRunnerRole.roleArn,
                },
                imageRepository: {
                    imageIdentifier: `${ecrRepository.repositoryUri}:latest`, // Use the image from ECR
                    imageRepositoryType: 'ECR',
                    imageConfiguration: {
                        port: '8080', // Port exposed by the Spring Boot app
                    },
                },
            },
            instanceConfiguration: {
                cpu: '1 vCPU',
                memory: '2 GB',
            },
        });

        // Output the App Runner service URL
        new cdk.CfnOutput(this, 'AppRunnerServiceUrl', {
            value: `https://${appRunnerService.attrServiceUrl}`,
        });
    }
}
