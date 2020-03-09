# action-run

Run any GitHub Actions that expose a function in `module.exports`, or any [actions-toolkit](https://github.com/JasonEtco/actions-toolkit) based GitHub actions locally.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/action-run.svg)](https://npmjs.org/package/action-run)
[![Downloads/week](https://img.shields.io/npm/dw/action-run.svg)](https://npmjs.org/package/action-run)
[![License](https://img.shields.io/npm/l/action-run.svg)](https://github.com/mheap/action-run/blob/master/package.json)

* [Usage](#usage)
* [Configuration](#configuration)
* [Providing Inputs](#providing-inputs)
* [Available Configuration](#available-configuration)

# Installation

```
npm install -g action-run
```

# Usage

Provide the event to trigger (e.g. `pull_request`, see https://developer.github.com/v3/activity/events/types/ for a full list) and a path to your node based action, and we'll take care of the rest.

```
action-run <event> </path/to/action.js>
```

# Configuration

You can specify any of the `GITHUB_*` environment variables required using either environment variables or command flags.

> **IMPORTANT:** action-run does *not* allow you to set a `GITHUB_TOKEN`. If your action needs to interact with the API, you'll need to set this yourself by running `export GITHUB_TOKEN="<token here>"`

Here's how you'd test a new issue comment being added using flags:

```
action-run -e ./issue_payload.json -u some-actor issue_comment </path/to/action.js>
```

Alternatively, you can set those values as environment variables:

```
export GITHUB_EVENT_PATH=./issue_payload.json
export GITHUB_ACTOR=some-actor
action-run issue_comment /path/to/action.js
```

To see the current configuration, you can run `action-run EVENT_NAME --debug`

```
Name              Value
GITHUB_WORKFLOW   Toolkit Demo Workflow
GITHUB_ACTION     Demo Action
GITHUB_ACTOR      mheap
GITHUB_REPOSITORY mheap/action-run
GITHUB_EVENT_NAME event
GITHUB_EVENT_PATH /var/folders/0t/yw3sznns1_5d8jj404h3cbpw0000gn/T/tmp-236061PM5kY7WZhTb
GITHUB_WORKSPACE  ./
GITHUB_SHA        67a4e61884902fd9291209f9403baf21c4cd72c5
```

# Providing Inputs

In addition to the `GITHUB_*` environment variables, you may want to provide inputs to your action. You can provide the `-i` flag multiple times to define your inputs

```
action-run <event> </path/to/action.js> -i trusted=mheap -i limit=5
```

Any defined inputs will also be shown when running `action-run EVENT_NAME --debug`

```
Name              Value
...snip...
INPUT_TRUSTED     mheap
INPUT_LIMIT       5
```

# Available configuration

You can run `--help` to see the available flags

```
USAGE
  $ action-run EVENT_NAME ACTION

OPTIONS
  -a, --action=action          [default: Demo Action] Action name
  -d, --workspace=workspace    [default: ./] Path to where the repo is checked out
  -e, --event_path=event_path  Path to a JSON file containing event data
  -i, --input=input            Define an input value
  -r, --repository=repository  [default: mheap/action-run] Repository (in repo/name format)
  -s, --sha=sha                [default: 67a4e61884902fd9291209f9403baf21c4cd72c5] Commit SHA
  -u, --actor=actor            [default: mheap] Actor name
  -v, --version                show CLI version
  -w, --workflow=workflow      [default: Toolkit Demo Workflow] Workflow name
  --debug                      Show the current configuration
```

