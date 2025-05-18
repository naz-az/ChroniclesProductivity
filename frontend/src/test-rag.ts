/**
 * Test script for RAG service functionality
 * 
 * This script tests the RAG (Retrieval-Augmented Generation) service
 * by creating mock embeddings and testing simple similarity searches.
 */

// Dummy interfaces to simulate the database structures
interface TestEntity {
  id: string;
  type: string;
  content: string;
}

// Mock embedding record structure
interface EmbeddingRecord {
  id: string;
  type: string;
  embedding: number[];
  content: string;
  metadata: Record<string, any>;
}

// Create some test data
const testData: TestEntity[] = [
  {
    id: '1',
    type: 'project',
    content: 'Project: "Website Redesign" (ID: p123)\nStatus: In Progress, Priority: High\nDescription: Complete redesign of company website\nDue Date: 2023-12-31'
  },
  {
    id: '2',
    type: 'softwareTask',
    content: 'Task: "Fix homepage loading issue" (ID: t456)\nStatus: Open, Priority: High, Type: Bug\nDescription: Homepage is loading slowly for users on mobile devices\nRepository: website'
  },
  {
    id: '3',
    type: 'financialTransaction',
    content: 'Expense: "Server hosting" (ID: f789)\nAmount: $199.99, Date: 2023-11-15\nCategory: IT Infrastructure'
  },
  {
    id: '4',
    type: 'bill',
    content: 'Bill: "AWS Monthly" (ID: b101)\nAmount: $350.00, Due Date: 2023-12-01, Status: Pending\nCategory: Cloud Services\nRecurring: Yes'
  }
];

// Simple function to create a mock embedding (simplified for testing)
const createMockEmbedding = (text: string, dimensionality: number = 384): number[] => {
  // For testing we'll create a simple hash-based embedding
  // This isn't a real embedding but will suffice for testing similarity
  const hash = Array.from(text).reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  // Create an array of values deterministically from the hash
  const embedding = new Array(dimensionality).fill(0);
  const seed = Math.abs(hash);
  
  for (let i = 0; i < dimensionality; i++) {
    // Generate a value between 0 and 1 based on the seed and position
    const val = (Math.sin(seed * i) + 1) / 2;
    embedding[i] = val;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
};

// Simple cosine similarity function (same as in the actual implementation)
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Create embeddings for all test data
const createEmbeddings = (): EmbeddingRecord[] => {
  return testData.map(entity => ({
    id: entity.id,
    type: entity.type,
    embedding: createMockEmbedding(entity.content),
    content: entity.content,
    metadata: { ...entity }
  }));
};

// Perform a semantic search using the mock embeddings
const performSearch = (
  query: string, 
  embeddings: EmbeddingRecord[], 
  pageContext?: string,
  limit: number = 2
): {content: string, similarity: number, type: string}[] => {
  try {
    // Generate embedding for the query
    const queryEmbedding = createMockEmbedding(query);
    
    // Compute similarity scores for all embeddings
    let searchResults = embeddings.map(record => {
      const similarity = cosineSimilarity(queryEmbedding, record.embedding);
      return {
        content: record.content,
        similarity,
        type: record.type,
        metadata: record.metadata
      };
    });
    
    // Boost scores for results that match the current page context
    if (pageContext) {
      searchResults = searchResults.map(result => {
        // If the context is evident in the content, boost the score
        const contextRelevant = 
          result.type.toLowerCase().includes(pageContext.toLowerCase()) ||
          JSON.stringify(result.metadata).toLowerCase().includes(pageContext.toLowerCase());
        
        return {
          ...result,
          similarity: contextRelevant ? result.similarity * 1.5 : result.similarity
        };
      });
    }
    
    // Sort by similarity score (highest first)
    searchResults.sort((a, b) => b.similarity - a.similarity);
    
    // Return the top N results
    return searchResults.slice(0, limit).map(r => ({ 
      content: r.content,
      similarity: r.similarity,
      type: r.type
    }));
  } catch (error) {
    console.error('Error performing mock semantic search:', error);
    return [];
  }
};

// Run some test queries
const runTests = () => {
  console.log('--- RAG Service Test ---');
  
  const embeddings = createEmbeddings();
  console.log(`Created ${embeddings.length} test embeddings`);
  
  // Test query 1: Without page context
  const query1 = 'website issues';
  console.log(`\nQuery: "${query1}" (no context):`);
  const results1 = performSearch(query1, embeddings);
  results1.forEach((result, i) => {
    console.log(`${i+1}. [${result.type}] (score: ${result.similarity.toFixed(4)})\n   ${result.content.split('\n')[0]}`);
  });
  
  // Test query 2: With page context
  const query2 = 'monthly payment';
  const context2 = 'financialTransaction';
  console.log(`\nQuery: "${query2}" (context: ${context2}):`);
  const results2 = performSearch(query2, embeddings, context2);
  results2.forEach((result, i) => {
    console.log(`${i+1}. [${result.type}] (score: ${result.similarity.toFixed(4)})\n   ${result.content.split('\n')[0]}`);
  });
  
  // Test query 3: With different page context
  const query3 = 'website development';
  const context3 = 'project';
  console.log(`\nQuery: "${query3}" (context: ${context3}):`);
  const results3 = performSearch(query3, embeddings, context3);
  results3.forEach((result, i) => {
    console.log(`${i+1}. [${result.type}] (score: ${result.similarity.toFixed(4)})\n   ${result.content.split('\n')[0]}`);
  });
};

// Run the tests
runTests(); 