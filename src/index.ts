function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
  const ts = modules.typescript;

  function create(info: ts.server.PluginCreateInfo) {
    const whatToRemove: string[] = info.config.remove || ["caller"];

    // Diagnostic logging
    info.project.projectService.logger.info("I'm getting set up now! Check the log for this message. Awuuuuu WufWuf");

    const proxy: ts.LanguageService = Object.create(null);
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      debugger;

      // Log when the method is invoked
      info.project.projectService.logger.info(`getCompletionsAtPosition called for file: ${fileName} at position: ${position}`);

      const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
      if (!prior) return;

      // Log initial completion list length
      info.project.projectService.logger.info(`Initial completion list length: ${prior.entries.length}`);

      // Filter out unwanted entries
      const oldLength = prior.entries.length;
      prior.entries = prior.entries.filter(e => whatToRemove.indexOf(e.name) < 0);

      // Log number of entries removed
      if (oldLength !== prior.entries.length) {
        const entriesRemoved = oldLength - prior.entries.length;
        info.project.projectService.logger.info(`Removed ${entriesRemoved} entries from the completion list`);
      }

      // Apply custom sorting if entries contain numbers
      prior.entries = prior.entries.map(entry => {
        const match = entry.name.match(/(\d+)/);
        if (match) {
          // Pad numbers with leading zeros based on the largest number length
          const paddedNumber = match[0].padStart(5, '0'); // Adjust 5 to the expected max length
          entry.sortText = entry.name.replace(match[0], paddedNumber);
        }
        return entry;
      });

      // Log before sorting
      info.project.projectService.logger.info("Applying custom sort to completion list");

      prior.entries.sort((a, b) => a.sortText.localeCompare(b.sortText));

      // Log sorted list length
      info.project.projectService.logger.info(
        `Sorted ${prior.entries.length} entries, with custom sort applied for entries with numbers`
      );

      return prior;
    };

    return proxy;
  }

  return { create };
}

export = init;
