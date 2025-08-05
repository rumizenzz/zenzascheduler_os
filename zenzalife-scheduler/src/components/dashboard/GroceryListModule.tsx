import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, TodoItem } from '@/lib/supabase'
import dayjs from 'dayjs'
import { Plus, ShoppingCart, Trash2, Pencil, Check, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function GroceryListModule() {
  const { user } = useAuth()
  const [items, setItems] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (user) {
      void loadItems()
    }
  }, [user])

  const loadItems = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', 'grocery')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to load items: ' + error.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const saveItem = async () => {
    if (!user || !content.trim()) return
    const { error } = await supabase.from('todo_items').insert({
      user_id: user.id,
      content: content.trim(),
      category: 'grocery',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save item: ' + error.message)
    } else {
      setContent('')
      setShowAdd(false)
      await loadItems()
      toast.success('Item added')
    }
  }

  const startEdit = (item: TodoItem) => {
    setEditingId(item.id)
    setEditContent(item.content)
  }

  const updateItem = async () => {
    if (!user || !editingId || !editContent.trim()) return
    const { error } = await supabase
      .from('todo_items')
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', editingId)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to update item: ' + error.message)
    } else {
      setEditingId(null)
      setEditContent('')
      await loadItems()
      toast.success('Item updated')
    }
  }

  const deleteItem = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from('todo_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to delete item: ' + error.message)
    } else {
      await loadItems()
      toast.success('Item deleted')
    }
  }

  const markBought = async (item: TodoItem) => {
    if (!user) return
    const { error } = await supabase
      .from('todo_items')
      .update({ completed: !item.completed, missing: item.completed ? item.missing : false, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to update item: ' + error.message)
    } else {
      await loadItems()
    }
  }

  const markMissing = async (item: TodoItem) => {
    if (!user) return
    const { error } = await supabase
      .from('todo_items')
      .update({ missing: !item.missing, completed: item.missing ? item.completed : false, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to update item: ' + error.message)
    } else {
      await loadItems()
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          Grocery List
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {showAdd && (
        <div className="card-floating bg-purple-900/80 text-white p-4 space-y-4">
          <textarea
            className="textarea-dreamy w-full"
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What do you need to buy?"
          />
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-dreamy-primary" onClick={saveItem}>
              Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map(i => (
            <div key={i.id} className="bg-gradient-to-br from-purple-800 via-purple-700 to-pink-600 p-4 rounded-lg text-white">
              {editingId === i.id ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs opacity-80">
                      {dayjs(i.created_at).format('YYYY-MM-DD hh:mm:ss A')}
                    </span>
                  </div>
                  <textarea
                    className="textarea-dreamy w-full mb-2"
                    rows={3}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end text-sm">
                    <button className="btn-secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                    <button className="btn-dreamy-primary" onClick={updateItem}>
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs opacity-80">
                      {dayjs(i.created_at).format('YYYY-MM-DD hh:mm:ss A')}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        className={`flex items-center gap-1 ${i.completed ? 'text-green-400' : 'hover:text-green-200'}`}
                        onClick={() => markBought(i)}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        className={`flex items-center gap-1 ${i.missing ? 'text-red-400' : 'hover:text-red-200'}`}
                        onClick={() => markMissing(i)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        className="flex items-center gap-1 hover:text-purple-200"
                        onClick={() => startEdit(i)}
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button
                        className="flex items-center gap-1 hover:text-purple-200"
                        onClick={() => deleteItem(i.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                  <div className={`whitespace-pre-wrap ${i.completed ? 'line-through opacity-70' : ''} ${i.missing ? 'text-red-300 opacity-70 line-through' : ''}`}>{i.content}</div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">No items yet</div>
      )}
    </div>
  )
}
