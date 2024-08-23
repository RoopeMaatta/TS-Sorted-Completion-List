function init(modules: { typescript: typeof import("typescript/lib/tsserverlibrary") }) {
  const ts = modules.typescript;

  function create(info: ts.server.PluginCreateInfo) {
    const proxy: ts.LanguageService = Object.create(null);
    
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      try {
        const prior = info.languageService.getCompletionsAtPosition(fileName, position, options);
        if (!prior) return;

        // Apply custom sorting if entries contain numbers
        prior.entries = prior.entries.map(entry => applyCustomSort(entry));

        // Sort the completion entries alphabetically
        prior.entries.sort((a, b) => a.sortText.localeCompare(b.sortText));

        return prior;
      } catch {
        return undefined;
      }
    };

    return proxy;
  }

  return { create };
}

function applyCustomSort(entry: ts.CompletionEntry): ts.CompletionEntry {
  const match = entry.name.match(/(\d+)/);
  if (match) {
    // Pad numbers with leading zeros based on the largest number length
    const paddedNumber = match[0].padStart(5, '0'); // Adjust 5 to the expected max length
    entry.sortText = entry.name.replace(match[0], paddedNumber);
  }
  return entry;
}

export = init;
