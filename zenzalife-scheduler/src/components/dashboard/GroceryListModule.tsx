import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, TodoItem, GroceryList } from '@/lib/supabase'
import dayjs from 'dayjs'
import { Plus, ShoppingCart, Trash2, Pencil, Check, X, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function GroceryListModule() {
  const { user } = useAuth()
  const [lists, setLists] = useState<GroceryList[]>([])
  const [selectedList, setSelectedList] = useState<GroceryList | null>(null)
  const [items, setItems] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showAddList, setShowAddList] = useState(false)
  const [listTitle, setListTitle] = useState('')
  const [listDate, setListDate] = useState(dayjs().format('YYYY-MM-DD'))

  useEffect(() => {
    if (user) {
      void initialize()
    }
  }, [user])

  useEffect(() => {
    if (user && selectedList) {
      void loadItems(selectedList.id)
    }
  }, [user, selectedList])

  const loadLists = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('grocery_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('list_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to load lists: ' + error.message)
    } else {
      setLists(data || [])
    }
  }

  const loadItems = async (listId: string) => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', 'grocery')
      .eq('list_id', listId)
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to load items: ' + error.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const initialize = async () => {
    try {
      await supabase.functions.invoke('ensure-grocery-schema')
    } catch (err) {
      console.error('Failed to ensure grocery schema', err)
    }
    await loadLists()
  }

  const saveList = async () => {
    if (!user || !listTitle.trim()) return
    const { error } = await supabase.from('grocery_lists').insert({
      user_id: user.id,
      title: listTitle.trim(),
      list_date: listDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save list: ' + error.message)
    } else {
      setListTitle('')
      setListDate(dayjs().format('YYYY-MM-DD'))
      setShowAddList(false)
      await loadLists()
      toast.success('List added')
    }
  }

  const deleteList = async (id: string) => {
    if (!user) return
    const { error: itemsError } = await supabase
      .from('todo_items')
      .delete()
      .eq('user_id', user.id)
      .eq('list_id', id)
    if (itemsError) {
      toast.error('Failed to delete items: ' + itemsError.message)
      return
    }
    const { error } = await supabase
      .from('grocery_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to delete list: ' + error.message)
    } else {
      if (selectedList?.id === id) {
        setSelectedList(null)
        setItems([])
      }
      await loadLists()
      toast.success('List deleted')
    }
  }

  const saveItem = async () => {
    if (!user || !selectedList || !content.trim()) return
    const { error } = await supabase.from('todo_items').insert({
      user_id: user.id,
      content: content.trim(),
      category: 'grocery',
      list_id: selectedList.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save item: ' + error.message)
    } else {
      setContent('')
      setShowAdd(false)
      await loadItems(selectedList.id)
      toast.success('Item added')
    }
  }

  const startEdit = (item: TodoItem) => {
    setEditingId(item.id)
    setEditContent(item.content)
  }

  const updateItem = async () => {
    if (!user || !selectedList || !editingId || !editContent.trim()) return
    const { error } = await supabase
      .from('todo_items')
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', editingId)
      .eq('user_id', user.id)
      .eq('list_id', selectedList.id)
    if (error) {
      toast.error('Failed to update item: ' + error.message)
    } else {
      setEditingId(null)
      setEditContent('')
      await loadItems(selectedList.id)
      toast.success('Item updated')
    }
  }

  const deleteItem = async (id: string) => {
    if (!user || !selectedList) return
    const { error } = await supabase
      .from('todo_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('list_id', selectedList.id)
    if (error) {
      toast.error('Failed to delete item: ' + error.message)
    } else {
      await loadItems(selectedList.id)
      toast.success('Item deleted')
    }
  }

  const markBought = async (item: TodoItem) => {
    if (!user || !selectedList) return
    const { error } = await supabase
      .from('todo_items')
      .update({ completed: !item.completed, missing: item.completed ? item.missing : false, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .eq('user_id', user.id)
      .eq('list_id', selectedList.id)
    if (error) {
      toast.error('Failed to update item: ' + error.message)
    } else {
      await loadItems(selectedList.id)
    }
  }

  const markMissing = async (item: TodoItem) => {
    if (!user || !selectedList) return
    const { error } = await supabase
      .from('todo_items')
      .update({ missing: !item.missing, completed: item.missing ? item.completed : false, updated_at: new Date().toISOString() })
      .eq('id', item.id)
      .eq('user_id', user.id)
      .eq('list_id', selectedList.id)
    if (error) {
      toast.error('Failed to update item: ' + error.message)
    } else {
      await loadItems(selectedList.id)
    }
  }

  if (!selectedList) {
    return (
      <div className="space-y-6 pb-24">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" />
            Grocery Lists
          </h1>
          <button onClick={() => setShowAddList(true)} className="btn-dreamy-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add List
          </button>
        </div>

        {showAddList && (
          <div className="card-floating bg-purple-900/80 text-white p-4 space-y-4">
            <input
              className="input-dreamy w-full"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="List title"
            />
            <input
              type="date"
              className="input-dreamy w-full"
              value={listDate}
              onChange={(e) => setListDate(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button className="btn-secondary" onClick={() => setShowAddList(false)}>
                Cancel
              </button>
              <button className="btn-dreamy-primary" onClick={saveList}>
                Save
              </button>
            </div>
          </div>
        )}

        {lists.length > 0 ? (
          <div className="space-y-4">
            {lists.map((l) => (
              <div
                key={l.id}
                className="bg-gradient-to-br from-purple-800 via-purple-700 to-pink-600 p-4 rounded-lg text-white flex justify-between items-center"
              >
                <div>
                  <div className="text-lg">{l.title}</div>
                  {l.list_date && (
                    <div className="text-xs opacity-80">{dayjs(l.list_date).format('YYYY-MM-DD')}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <button className="btn-secondary" onClick={() => setSelectedList(l)}>
                    Open
                  </button>
                  <button
                    className="flex items-center gap-1 hover:text-purple-200"
                    onClick={() => deleteList(l.id)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">No lists yet</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <button onClick={() => setSelectedList(null)} className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Lists
        </button>
        <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          {selectedList.title}
        </h1>
        <button onClick={() => setShowAdd(true)} className="btn-dreamy-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
      {selectedList.list_date && (
        <div className="text-sm text-center text-purple-200">
          {dayjs(selectedList.list_date).format('MMMM D, YYYY')}
        </div>
      )}

      {showAdd && (
        <div className="card-floating bg-purple-900/80 text-white p-4 space-y-4">
          <textarea
            className="textarea-dreamy w-full"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
          {items.map((i) => (
            <div
              key={i.id}
              className="bg-gradient-to-br from-purple-800 via-purple-700 to-pink-600 p-4 rounded-lg text-white"
            >
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
                    onChange={(e) => setEditContent(e.target.value)}
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
                  <div
                    className={`whitespace-pre-wrap ${i.completed ? 'line-through opacity-70' : ''} ${i.missing ? 'text-red-300 opacity-70 line-through' : ''}`}
                  >
                    {i.content}
                  </div>
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
