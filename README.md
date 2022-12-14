# Demo App (UNDER DEVELOPMENT)
An app to Demo Rocket.Chat Apps

## About this project
This project was created to serve as a central hub with all the features from the Rocket.Chat Apps Engine. Check below all the features and it's implementation status

## Current Features
Here are some of the features:

### Settings
  - ✅ Declare App permissions in app.json
  - ✅ Create persistant app settings
  - ✅ Monitor settings change
  - ✅ Create different Settings Types (STRING, SELECT, CODE BOOLEAN)
  - ✅ Settings Labels with labels in multiple languages
  - Settings Sections (Not implemented)

### Logging
  - ✅ Log from inside the app
  - ✅ Log to sdtout

### Simple Slash Commands
  - ✅ [Slash Command that returns a Message](https://github.com/RocketChat/Rocket.Chat.Demo.App/wiki/Example-Slash-Command#message-example)
  - ✅ [Slash Command that returns a Notification](https://github.com/RocketChat/Rocket.Chat.Demo.App/wiki/Example-Slash-Command#notification-example)
   - ✅ [Slash Command that send a Direct](https://github.com/RocketChat/Rocket.Chat.Demo.App/wiki/Example-Slash-Command#direct-example) 
  - ✅ [Slash Command with subcommand pattern and subcommand aliases](https://github.com/RocketChat/Rocket.Chat.Demo.App/wiki/Example-Slash-Command#some-good-practices) 

### Advanced Slash Commands
  - ✅ Help and Description
  - Slash Command with Preview
### Action Buttons
  - ✅ Registering Action Buttons
  - ✅ Handling Action Buttons

### Contextual Bars and Modals
- ✅ Opening Modal and Contextual Bars
- ✅ Reacting to modal and Contextual Bars

### Handlers
- ✅ View Submit Handler
- ✅ Block Action Handler

### UI Blocks
  - Block building
  - 
### Data Persistence
- Store user inputs associated with room, user or message
- Read user inputs
- ✅ Data Persistence using Registered API

### Endpoints
- ✅ Endpoint Registration (POST, GET and DELETE Methods)
- ✅ Endpoint Handlers

### Scheduling
- Scheduling

### Events and Hooks
- Registering an Event

### External Dependencies
- Adding external dependencies to your App.

### App Lyfecycle
- initialize
- ✅ extendConfiguration
- onEnable
- onDisable
- ✅ onSettingUpdated

### Internal State Management