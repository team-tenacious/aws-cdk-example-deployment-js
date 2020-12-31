'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const cdk = {
    core: require('@aws-cdk/core'),
    ec2: require('@aws-cdk/aws-ec2'),
    ecs: {
        core: require('@aws-cdk/aws-ecs'),
        patterns: require('@aws-cdk/aws-ecs-patterns')
    },
    logs: require('@aws-cdk/aws-logs'),
    ecr: {
        assets: require('@aws-cdk/aws-ecr-assets')
    }
};
const path = require('path');
class ExampleStack extends cdk.core.Stack {
  constructor (parent, name, props) {
    super(parent, name, props);
    const self = this;
    const vpc = new cdk.ec2.Vpc(self, "ExampleVPC", {
        maxAzs: 2
    });
    const cluster = new cdk.ecs.core.Cluster(self, "ServiceCluster", { vpc });
    cluster.addDefaultCloudMapNamespace({ name:"service.local" });

    const assets = {
        frontend: new cdk.ecr.assets.DockerImageAsset(
            self, "frontend", { directory: path.resolve(__dirname, "../frontend"), file: "Dockerfile" }
        )
    };

    const tasks = {
        frontend: new cdk.ecs.core.FargateTaskDefinition(
            self, "frontend-task", { cpu:512, memoryLimitMiB:2048}
        ),
        redis: new cdk.ecs.core.FargateTaskDefinition(
            self, "redis-task", { cpu:512, memoryLimitMiB:2048}
        )
    }

    tasks.frontend.addContainer("frontend", {
        image:cdk.ecs.core.ContainerImage.fromDockerImageAsset(assets.frontend),
        essential:true,
        environment:{"LOCALDOMAIN": "service.local"},
        logging:cdk.ecs.core.LogDrivers.awsLogs({
                streamPrefix: "FrontendContainer",
                logRetention: cdk.logs.RetentionDays.ONE_WEEK
            }
        )
    }).addPortMappings({ containerPort: 3000, hostPort: 3000 });

    tasks.redis.addContainer("redis", {
        image:cdk.ecs.core.ContainerImage.fromRegistry("redis:alpine"),
        essential:true,
        environment:{"LOCALDOMAIN": "service.local"},
        logging:cdk.ecs.core.LogDrivers.awsLogs({
                streamPrefix: "RedisContainer",
                logRetention: cdk.logs.RetentionDays.ONE_WEEK
            }
        )
    }).addPortMappings({ containerPort: 6379, hostPort: 6379 });

    const services = {
        frontend: new cdk.ecs.patterns.NetworkLoadBalancedFargateService(
            self,
            "frontend-service",
            {
                serviceName:"frontend",
                cluster,
                cloudMapOptions: { name:"frontend" },
                cpu:512,
                desiredCount: 2,
                taskDefinition: tasks.frontend,
                memoryLimitMib: 2048,
                listenerPort: 80,
                publicLoadBalancer:true
            }
        ),
        redis: new cdk.ecs.patterns.NetworkLoadBalancedFargateService(
            self,
            "redis-service",
            {
                serviceName: "redis",
                cluster,
                cloudMapOptions: { name:"redis" },
                cpu:512,
                desiredCount: 2,
                taskDefinition: tasks.redis,
                memoryLimitMib: 2048,
                listenerPort: 6379,
                publicLoadBalancer: false
            }
        )
    };
    services.frontend.service.connections.allowFromAnyIpv4(cdk.ec2.Port.tcp(3000), "example inbound");
    services.redis.service.connections.allowFrom(services.frontend.service, cdk.ec2.Port.tcp(6379), "example frontend inbound");
  }
}
exports.ExampleStack = ExampleStack;
