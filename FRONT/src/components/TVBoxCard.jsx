import { Link } from "react-router-dom";

export default function TVBoxCard({ box }) {
  const border = box.status === "online" ? "border-green-500" : "border-red-500";
  return (
    <Link to={`/tvbox/${box.id}`} className="block">
      <div className={`p-4 rounded-lg shadow-lg bg-gray-900 border-2 ${border}
                       transition hover:scale-[1.02] hover:shadow-xl`}>
        <h2 className="text-xl font-bold mb-2">{box.name}</h2>
        <p>
          Status:{" "}
          <span className={box.status === "online" ? "text-green-400" : "text-red-400"}>
            {box.status}
          </span>
        </p>
        <p>Usuários: {box.users}</p>
        <p>CPU: {box.cpu}</p>
        <p>RAM: {box.memory}</p>
      </div>
    </Link>
  );
}
