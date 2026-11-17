import { NavLink } from "react-router-dom";
import { Building2, BriefcaseBusiness, ClipboardList, LayoutDashboard, Mail, Users } from "lucide-react";
const items=[['dashboard','Overview',LayoutDashboard],['users','Users',Users],['companies','Companies',Building2],['jobs','Jobs',BriefcaseBusiness],['applications','Applications',ClipboardList],['contacts','Inbox',Mail]];
export const AdminSidebar=()=> <nav aria-label="Admin workspace">{items.map(([path,label,Icon])=><NavLink key={path} to={`/admin/${path}`}><Icon size={19} aria-hidden="true"/>{label}</NavLink>)}</nav>;
