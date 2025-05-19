import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, UserPlus, Check, X } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const {
    friends,
    receivedRequests,
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [friendIdToAdd, setFriendIdToAdd] = useState("");

  useEffect(() => {
    getFriends();
    getFriendRequests();
  }, []);

  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFriend = () => {
    if (!friendIdToAdd) return;
    sendFriendRequest(friendIdToAdd);
    setFriendIdToAdd("");
    setShowAddDialog(false);
  };

  const handleAccept = (userId) => {
    acceptFriendRequest(userId);
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Friends</span>
        </div>

        {/* Campo de pesquisa */}
        <div className="mt-4 hidden lg:block">
          <input
            type="text"
            placeholder="Buscar amigos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm input-bordered w-full"
          />
        </div>

        {/* Botão de adicionar amigo */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowAddDialog(true)}
            className="btn btn-sm gap-2"
          >
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>

          {/* Badge de notificação */}
          {receivedRequests.length > 0 && (
            <div className="indicator">
              <span className="badge badge-error badge-sm">
                {receivedRequests.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Seção: Pedidos de amizade recebidos */}
      {receivedRequests.length > 0 && (
        <div className="px-3 py-2">
          <h3 className="text-sm text-zinc-500 mb-2">Pedidos de amizade</h3>
          {receivedRequests.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between gap-2 bg-base-300 p-2 rounded mb-1"
            >
              <div className="flex items-center gap-2">
                <img
                  src={user.profilePic || "/avatar.png"}
                  className="size-8 rounded-full"
                />
                <span className="text-sm truncate">{user.fullName}</span>
              </div>
              <button
                onClick={() => handleAccept(user._id)}
                className="btn btn-xs btn-success"
              >
                <Check className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lista de amigos */}
      <div className="overflow-y-auto py-2 px-1">
        {filteredFriends.length === 0 && (
          <p className="text-center text-zinc-500 py-4">
            Nenhum amigo encontrado
          </p>
        )}

        {filteredFriends.map((friend) => (
          <button
            key={friend._id}
            onClick={() => setSelectedUser(friend)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
              selectedUser?._id === friend._id
                ? "bg-base-300 ring-1 ring-base-300"
                : ""
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={friend.profilePic || "/avatar.png"}
                alt={friend.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(friend._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{friend.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(friend._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal de adicionar amigo */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-base-100 p-5 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Adicionar amigo por ID</h2>
            <input
              type="text"
              placeholder="ID do usuário"
              value={friendIdToAdd}
              onChange={(e) => setFriendIdToAdd(e.target.value)}
              className="input input-bordered w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddDialog(false)} className="btn btn-outline btn-sm">
                Cancelar
              </button>
              <button onClick={handleAddFriend} className="btn btn-primary btn-sm">
                Enviar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
