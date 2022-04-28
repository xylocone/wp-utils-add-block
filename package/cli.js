import path from "path";
import url from "url";
import { execa } from "execa";
import inquirer from "inquirer";
import Scaffold from "scaffold-generator";
import mustache from "mustache";
import chalk from "chalk";
import { capitalCase } from "change-case";

let categoryChoices = [
  "text",
  "media",
  "design",
  "widgets",
  "theme",
  "embed",
  "custom",
];

const defaultOptions = {
  slug: path.basename(path.resolve(process.cwd(), "..")),
  title: "My Awesome Block",
  category: "widgets",
  description: "",
  icon: "smile",
  templateDirectory: path.resolve(
    url.fileURLToPath(import.meta.url),
    "../template"
  ),
  targetDirectory: path.join(process.cwd(), "blocks/src"),
};

let options = {};

export async function cli(args) {
  try {
    await assignOptions(args);
    await copyTemplateFiles();

    console.log("%s Block successfully added", chalk.bgGreen("SUCCESS!"));
  } catch (e) {
    console.error(
      "%s There was an error in completing this task.",
      chalk.bgRed("ERROR!")
    );
    console.trace(e);
  }
}

/**
 * Copy template files from the ./package/template dir into <calling process' cwd>/blocks/src
 */
async function copyTemplateFiles() {
  await execa("mkdir", [options.blockName], { cwd: options.targetDirectory });
  await new Scaffold({
    data: options,
    render: mustache.render,
  }).copy(
    options.templateDirectory,
    path.join(options.targetDirectory, options.blockName)
  );
}

/**
 * Prompt user to give input and map input to options
 */
async function assignOptions(args) {
  options.blockName =
    args[0] ||
    (await askUntilAnswered({
      name: "blockName",
      message: "Block name: ",
    }));

  const questions = [
    {
      name: "title",
      message: "Title: ",
      default: capitalCase(options.blockName),
    },
    {
      name: "slug",
      message: "Slug: ",
      default: defaultOptions.slug,
    },
    {
      name: "category",
      message: "Category: ",
      type: "list",
      choices: categoryChoices,
      default: categoryChoices.indexOf(defaultOptions.category),
    },
    {
      name: "customCategory",
      message: "Custom category: ",
      when: (answers) => answers.category === "custom",
    },
    {
      name: "description",
      message: "Description: ",
      default: defaultOptions.description,
    },
    {
      name: "icon",
      message: "Icon: ",
      default: defaultOptions.icon,
    },
  ];

  const answers = await inquirer.prompt(questions);

  // For each defaultOption, if the corresponding answer is empty, use the defaultOption
  // If custom category has been opted for, replace category's value with customCategory's value
  options = Object.assign(
    {},
    options,
    ...Object.keys(defaultOptions).map((key) => ({
      [key]: answers[key] || defaultOptions[key],
    })),
    {
      category:
        answers.category === "custom"
          ? answers.customCategory
          : answers.category,
    }
  );
}

/**
 * Keep asking the user the same question until they answer
 * @param {Object} question Inquirer question object
 * @returns User answer to the question
 */
async function askUntilAnswered(question) {
  let answer;

  while (!answer) {
    answer = (await inquirer.prompt([question]))[question.name];
  }

  return answer;
}
