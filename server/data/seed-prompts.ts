import { db } from '../db';
import { promptCategories, prompts, insertPromptCategorySchema, insertPromptSchema } from '../../shared/schema';
import * as promptCatalogData from './prompt-catalog.json';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const promptCatalog = promptCatalogData as {
  categories: Array<{
    name: string;
    description: string;
    prompts: Array<{
      key: string;
      name: string;
      description: string;
      systemMessage: string | null;
      promptText: string;
      variables: string[];
      model: string;
    }>;
  }>;
};

export async function seedPrompts() {
  console.log('🌱 Seeding prompt categories and prompts...');

  try {
    // Seed categories first
    const categoryMap = new Map<string, number>();
    
    for (const category of promptCatalog.categories) {
      const [insertedCategory] = await db
        .insert(promptCategories)
        .values({
          name: category.name,
          description: category.description,
        })
        .returning();
      
      categoryMap.set(category.name, insertedCategory.id);
      console.log(`✓ Created category: ${category.name}`);
    }

    // Seed prompts
    let totalPrompts = 0;
    for (const category of promptCatalog.categories) {
      const categoryId = categoryMap.get(category.name);
      if (!categoryId) continue;

      for (const prompt of category.prompts) {
        await db.insert(prompts).values({
          categoryId,
          name: prompt.name,
          description: prompt.description,
          promptKey: prompt.key,
          promptText: prompt.promptText,
          systemMessage: prompt.systemMessage,
          variables: prompt.variables,
          aiModel: prompt.model,
          status: 'active',
          version: '1.0',
        });
        totalPrompts++;
        console.log(`  ✓ Created prompt: ${prompt.name}`);
      }
    }

    console.log(`✅ Successfully seeded ${promptCatalog.categories.length} categories and ${totalPrompts} prompts`);
  } catch (error) {
    console.error('❌ Error seeding prompts:', error);
    throw error;
  }
}

// Setup for detecting if script is run directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this module is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  seedPrompts()
    .then(() => {
      console.log('Seed complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
