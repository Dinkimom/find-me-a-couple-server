import path from 'path';
import dotenv from 'dotenv';
import commandLineArgs, { CommandLineOptions } from 'command-line-args';

(() => {
  // Setup command line options
  const options: CommandLineOptions = commandLineArgs([
    {
      name: 'env',
      alias: 'e',
      defaultValue: 'development',
      type: String,
    },
  ]);

  // Set the env file
  if (options.env !== 'production') {
    const result2 = dotenv.config({
      path: path.join(__dirname, `env/${options.env as string}.env`),
    });

    console.log(options.env, result2);

    if (result2.error) {
      throw result2.error;
    }
  }
})();
