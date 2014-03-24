### Run these Commands from Terminal:
1. git clone https://github.com/neoborn/restifyvote.git
2. cd restifyvote
3. npm install
4. node server.js

### Deployment:
First, ensure that you have OpenShift Account and setup RHC, command line tool for OpenShift;
Next, run this command from the terminal (replace the app-name):
`rhc create-app <app-name> nodejs-0.10 --from-code https://github.com/neoborn/restifyvote.git`

[Reference Tutorial](www.openshift.com/blogs/day-27-restify-build-correct-rest-web-services-in-nodejs)