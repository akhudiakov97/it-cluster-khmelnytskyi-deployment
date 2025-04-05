import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FrontEndStack } from './front-end-stack';
import { BackEndStack } from './back-end-stack';

export class InfrastructureStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Deploy the front-end stack
        const frontEndStack = new FrontEndStack(this, 'FrontEndStack');

        // Deploy the back-end stack
        const backEndStack = new BackEndStack(this, 'BackEndStack');
    }
}
