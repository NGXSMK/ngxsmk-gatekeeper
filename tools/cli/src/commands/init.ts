import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

export function initCommand(): Command {
  const command = new Command('init')
    .description('Initialize ngxsmk-gatekeeper configuration')
    .option('-f, --force', 'Overwrite existing configuration')
    .option('-y, --yes', 'Skip interactive prompts and use defaults')
    .action(async (options) => {
      try {
        const configPath = path.join(process.cwd(), 'gatekeeper.config.json');
        
        if (fs.existsSync(configPath) && !options.force) {
          console.log(chalk.yellow('Configuration file already exists. Use --force to overwrite.'));
          return;
        }

        let config: any = {};

        if (options.yes) {
          config = {
            middlewares: [],
            onFail: '/login',
            debug: false,
          };
        } else {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'onFail',
              message: 'Redirect path when middleware fails:',
              default: '/login',
            },
            {
              type: 'confirm',
              name: 'debug',
              message: 'Enable debug mode?',
              default: false,
            },
            {
              type: 'confirm',
              name: 'addAuth',
              message: 'Add authentication middleware?',
              default: true,
            },
          ]);

          config = {
            middlewares: answers.addAuth ? ['auth'] : [],
            onFail: answers.onFail,
            debug: answers.debug,
          };
        }

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(chalk.green(`✓ Configuration file created: ${configPath}`));

        if (!options.yes) {
          const { createExample } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'createExample',
              message: 'Create example middleware file?',
              default: true,
            },
          ]);

          if (createExample) {
            const middlewarePath = path.join(process.cwd(), 'src', 'middlewares', 'auth.middleware.ts');
            const middlewareDir = path.dirname(middlewarePath);
            
            if (!fs.existsSync(middlewareDir)) {
              fs.mkdirSync(middlewareDir, { recursive: true });
            }

            const middlewareContent = `import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

export const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
  requireUser: true,
});
`;

            fs.writeFileSync(middlewarePath, middlewareContent);
            console.log(chalk.green(`✓ Example middleware created: ${middlewarePath}`));
          }
        }

        console.log(chalk.cyan('\nNext steps:'));
        console.log('1. Import and use the middleware in your app.config.ts or main.ts');
        console.log('2. Run "gatekeeper analyze" to check your route protection');
        console.log('3. Run "gatekeeper test" to test your middleware chains');

      } catch (error) {
        console.error(chalk.red('Error initializing configuration:'), error);
        process.exit(1);
      }
    });

  return command;
}

