const { Command, flags } = require("@oclif/command");
const { cli } = require("cli-ux");
const path = require("path");
const fs = require("fs");
var tmp = require("tmp");
tmp.setGracefulCleanup();

class ActionRunCommand extends Command {
  async run() {
    const { args } = this.parse(ActionRunCommand);
    const { flags } = this.parse(ActionRunCommand);

    // Make the event path optional. Not all actions use it
    let usingGeneratedEvent = false;
    if (!process.env.GITHUB_EVENT_PATH) {
      const tmpobj = tmp.fileSync();
      fs.writeFileSync(tmpobj.name, "{}");
      flags.event_path = tmpobj.name;
      usingGeneratedEvent = true;
    }

    // Use our flags to set environment variables which are read by the toolkit
    Object.assign(process.env, {
      GITHUB_WORKFLOW: flags.workflow,
      GITHUB_ACTION: flags.action,
      GITHUB_ACTOR: flags.actor,
      GITHUB_REPOSITORY: flags.repository,
      GITHUB_EVENT_NAME: args.event_name,
      GITHUB_EVENT_PATH: path.resolve(process.cwd(), flags.event_path),
      GITHUB_WORKSPACE: flags.workspace,
      GITHUB_SHA: flags.sha
    });

    // Add any inputs
    if (flags.input) {
      const inputs = {};
      flags.input.forEach(i => {
        const [key, ...value] = i.split("=");
        inputs[`INPUT_${key.toUpperCase()}`] = value.join("=");
      });

      Object.assign(process.env, inputs);
    }

    // For debug purposes, dump out all of the available flag values
    if (flags.debug) {
      const config = Object.keys(process.env)
        .filter(n => n.startsWith("GITHUB_") || n.startsWith("INPUT_"))
        .filter(n => n != "GITHUB_TOKEN")
        .map(k => {
          return { name: k, value: process.env[k] };
        });
      const columns = { name: {}, value: {} };
      return cli.table(config, columns);
    }

    // If we got this far, do we have an action JS file provided?
    if (!args.action) {
      this.error("Missing 1 required arg:\naction\nSee more help with --help");
    }

    // Do some sanity checking on the provided event
    if (!fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
      this.error(`Unable to load ${process.env.GITHUB_EVENT_PATH}`, {
        exit: 127
      });
    }

    // Try loading the event path. This will show JSON parse errors
    try {
      require(process.env.GITHUB_EVENT_PATH);
    } catch (e) {
      this.error(e.message);
    }

    const actionPath = path.resolve(process.cwd(), args.action);

    // If our action exposes a function, capture it to run later
    // At this point, it could execute the action directly, or return a module.exports function
    let action = require(actionPath);

    // If it returned a function, run it
    if (typeof action == "function") {
      return await action();
    }

    console.log("No action found. Did you add your action to module.exports?")
    process.exit(1);

  }
}

ActionRunCommand.description = `Run your actions-toolkit based actions locally
The GitHub environment variables may be set 
`;

ActionRunCommand.flags = {
  version: flags.version({ char: "v" }),
  workflow: flags.string({
    char: "w",
    description: "Workflow name",
    env: "GITHUB_WORKFLOW",
    default: "Action Run Demo Workflow"
  }),
  action: flags.string({
    char: "a",
    description: "Action name",
    env: "GITHUB_ACTION",
    default: "Demo Action"
  }),
  actor: flags.string({
    char: "u",
    description: "Actor name",
    env: "GITHUB_ACTOR",
    default: "mheap"
  }),
  workspace: flags.string({
    char: "d",
    description: "Path to where the repo is checked out",
    env: "GITHUB_WORKSPACE",
    default: "./"
  }),
  sha: flags.string({
    char: "s",
    description: "Commit SHA",
    env: "GITHUB_SHA",
    default: "67a4e61884902fd9291209f9403baf21c4cd72c5"
  }),
  repository: flags.string({
    char: "r",
    description: "Repository (in repo/name format)",
    env: "GITHUB_REPOSITORY",
    default: "mheap/action-run"
  }),
  event_path: flags.string({
    char: "e",
    description: "Path to a JSON file containing event data",
    env: "GITHUB_EVENT_NAME"
  }),
  input: flags.string({
    char: "i",
    description: "Define an input value",
    multiple: true
  }),
  debug: flags.boolean({
    description: "Show the current configuration",
    default: false
  })
};
ActionRunCommand.args = [
  { name: "event_name", required: true },
  { name: "action" }
];

module.exports = ActionRunCommand;
