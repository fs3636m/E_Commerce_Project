// store/ai/aiSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for sending messages
export const sendAIMessage = createAsyncThunk(
  "ai/sendMessage",
  async ({ message, messages, userId, productId }, { rejectWithValue }) => {
    try {
      const base = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, "");
      const response = await fetch(`${base}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message, messages, userId, productId }),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    conversations: {}, // Store multiple conversations by key (e.g., 'global', 'product-123')
    currentConversationKey: "global", // Default conversation
    loading: false,
    error: null,
  },
  reducers: {
    // Add a message to the conversation
    addMessage: (state, action) => {
      const { conversationKey = "global", message } = action.payload;
      if (!state.conversations[conversationKey]) {
        state.conversations[conversationKey] = [];
      }
      state.conversations[conversationKey].push(message);
    },
    
    // Clear a specific conversation
    clearConversation: (state, action) => {
      const conversationKey = action.payload || "global";
      state.conversations[conversationKey] = [];
      state.error = null;
    },
    
    // Set current conversation
    setConversationKey: (state, action) => {
      state.currentConversationKey = action.payload;
    },
    
    // Load conversations from localStorage
    loadConversations: (state) => {
      try {
        const saved = localStorage.getItem("aiConversations");
        if (saved) {
          const parsed = JSON.parse(saved);
          state.conversations = parsed.conversations || {};
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAIMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendAIMessage.fulfilled, (state, action) => {
        state.loading = false;
        const conversationKey = state.currentConversationKey;
        const aiMessage = {
          role: "assistant",
          content: action.payload.message,
          suggestedProducts: action.payload.suggestedProducts || [],
          responseType: action.payload.responseType || "general_help",
          timestamp: new Date().toISOString(),
        };
        
        if (!state.conversations[conversationKey]) {
          state.conversations[conversationKey] = [];
        }
        state.conversations[conversationKey].push(aiMessage);
      })
      .addCase(sendAIMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Unknown error";
        
        // Add error message to conversation
        const conversationKey = state.currentConversationKey;
        const errorMessage = {
          role: "assistant",
          content: "Sorry, I'm having trouble responding. Please try again.",
          isError: true,
          timestamp: new Date().toISOString(),
        };
        
        if (!state.conversations[conversationKey]) {
          state.conversations[conversationKey] = [];
        }
        state.conversations[conversationKey].push(errorMessage);
      });
  },
});

// Save to localStorage middleware
export const saveToLocalStorage = (store) => (next) => (action) => {
  const result = next(action);
  
  if (
    action.type?.startsWith("ai/") &&
    !action.type?.includes("loadConversations")
  ) {
    const state = store.getState().ai;
    try {
      localStorage.setItem("aiConversations", JSON.stringify({
        conversations: state.conversations,
        currentConversationKey: state.currentConversationKey,
      }));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }
  
  return result;
};

export const { 
  addMessage, 
  clearConversation, 
  setConversationKey, 
  loadConversations, 
  clearError 
} = aiSlice.actions;

export default aiSlice.reducer;