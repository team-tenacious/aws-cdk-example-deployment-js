# aws-cdk-example-deployment-js
A javascript example of using aws cdk to deploy multiple docker containers that are able to communicate with each other, this is shameless porting of Jeff Bryner's [great python example](https://github.com/jeffbryner/aws-cdk-example-deployment) - please read his detailed article [here](https://blog.jeffbryner.com/2020/07/20/aws-cdk-docker-explorations.html) - thanks Jeff, you saved me many hours!

## assumptions
- you have git installed
- you have nodejs and npm installed
- you have the latest cdk installed

## to make it go

```bash

git clone https://github.com/team-tenacious/aws-cdk-example-deployment-js.git
cd aws-cdk-example-deployment-js
npm i

# if you've not used cdk before you may need to bootstrap it into
# your aws environment (creates s3 bucket for cloud formation templates, etc)

cdk bootstrap

# test run to see if it creates a template
cdk synth

# if it's good, then deploy
cdk deploy

# it should warn you about upcoming changes and ask you to accept (a security precaution)
# at the end of the deployment you'll get outputs to the two loadbalanced services
# copy the url for the 'frontend' one, toss it into your browser and you should see the demo page

# clean up with a
cdk destroy
```