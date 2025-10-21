import { db } from '../db';
import { promptCategories, prompts } from '../../shared/schema';
import * as promptCatalogData from './prompt-catalog.json';

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
    const { eq } = await import('drizzle-orm');
    
    // Seed categories first (upsert logic)
    const categoryMap = new Map<string, number>();
    
    for (const category of promptCatalog.categories) {
      // Check if category already exists
      const existing = await db
        .select()
        .from(promptCategories)
        .where(eq(promptCategories.name, category.name))
        .limit(1);
      
      if (existing.length > 0) {
        categoryMap.set(category.name, existing[0].id);
        console.log(`✓ Category exists: ${category.name}`);
      } else {
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
    }

    // Seed prompts (upsert logic)
    let totalPrompts = 0;
    for (const category of promptCatalog.categories) {
      const categoryId = categoryMap.get(category.name);
      if (!categoryId) continue;

      for (const prompt of category.prompts) {
        // Check if prompt already exists
        const existing = await db
          .select()
          .from(prompts)
          .where(eq(prompts.promptKey, prompt.key))
          .limit(1);
        
        if (existing.length > 0) {
          console.log(`  ✓ Prompt exists: ${prompt.name}`);
        } else {
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
          console.log(`  ✓ Created prompt: ${prompt.name}`);
        }
        totalPrompts++;
      }
    }

    console.log(`✅ Successfully processed ${promptCatalog.categories.length} categories and ${totalPrompts} prompts`);
  } catch (error) {
    console.error('❌ Error seeding prompts:', error);
    throw error;
  }
}

// Removed standalone execution block to prevent process.exit() in production
// The seedPrompts() function is called directly from server/index.ts
