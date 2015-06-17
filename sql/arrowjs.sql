--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: arr_categories; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE arr_categories (
    id integer NOT NULL,
    parent integer NOT NULL,
    level smallint,
    name character varying(255) NOT NULL,
    alias character varying(255) NOT NULL,
    description text,
    published smallint NOT NULL,
    created_at timestamp without time zone,
    created_by integer,
    modified_at timestamp without time zone,
    modified_by integer
);


ALTER TABLE arr_categories OWNER TO postgres;

--
-- Name: arr_menu_detail; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE arr_menu_detail (
    id integer NOT NULL,
    menu_id integer NOT NULL,
    name character varying(255),
    attribute character(25),
    link character varying(255),
    parent_id integer,
    created_at timestamp without time zone,
    created_by integer,
    modified_at timestamp without time zone,
    modified_by integer,
    status character varying(25)
);


ALTER TABLE arr_menu_detail OWNER TO postgres;

--
-- Name: arr_menus; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE arr_menus (
    id integer NOT NULL,
    name character varying(255),
    status character varying(50),
    created_at timestamp without time zone,
    created_by integer,
    modified_at timestamp without time zone,
    modified_by integer,
    menu_order character varying DEFAULT 1000
);


ALTER TABLE arr_menus OWNER TO postgres;

--
-- Name: arr_posts; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE arr_posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    alias character varying(255) NOT NULL,
    intro_text text,
    full_text text,
    image character varying(255),
    tags text,
    hit bigint DEFAULT 0,
    published smallint NOT NULL,
    published_at timestamp without time zone,
    cache text,
    categories text,
    type character varying(15),
    seo_info text DEFAULT ''::text,
    created_at timestamp without time zone,
    created_by integer,
    modified_at timestamp without time zone,
    modified_by integer
);


ALTER TABLE arr_posts OWNER TO postgres;

--
-- Name: arr_role; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE arr_role (
    id integer NOT NULL,
    name character varying(255),
    rules character varying(2000),
    created_at timestamp without time zone,
    created_by integer,
    modified_at timestamp without time zone,
    modified_by integer,
    status character varying(15),
    f_rules character varying
);


ALTER TABLE arr_role OWNER TO postgres;

--
-- Name: arr_users; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE arr_users (
    id bigint NOT NULL,
    user_login character varying(60) DEFAULT ''::character varying NOT NULL,
    user_pass character varying(256) DEFAULT ''::character varying,
    user_email character varying(100) DEFAULT ''::character varying,
    user_url character varying(100) DEFAULT ''::character varying,
    user_registered timestamp without time zone DEFAULT now() NOT NULL,
    user_activation_key character varying(60) DEFAULT ''::character varying,
    display_name character varying(250) DEFAULT ''::character varying NOT NULL,
    user_image_url text,
    salt character varying DEFAULT 50,
    role_id integer,
    user_status character varying(50),
    reset_password_token text,
    reset_password_expires bigint
);


ALTER TABLE arr_users OWNER TO postgres;

--
-- Name: arr_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE arr_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE arr_users_id_seq OWNER TO postgres;

--
-- Name: arr_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE arr_users_id_seq OWNED BY arr_users.id;


--
-- Name: arr_widgets; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE arr_widgets (
    id bigint NOT NULL,
    sidebar character varying,
    data json,
    created_at timestamp without time zone,
    created_by integer,
    modified_at timestamp without time zone,
    modified_by integer,
    widget_type character varying,
    ordering integer DEFAULT 1
);


ALTER TABLE arr_widgets OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE categories_id_seq OWNED BY arr_categories.id;


--
-- Name: menu_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE menu_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE menu_detail_id_seq OWNER TO postgres;

--
-- Name: menu_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE menu_detail_id_seq OWNED BY arr_menu_detail.id;


--
-- Name: menus_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE menus_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE menus_id_seq OWNER TO postgres;

--
-- Name: menus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE menus_id_seq OWNED BY arr_menus.id;


--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE posts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE posts_id_seq OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE posts_id_seq OWNED BY arr_posts.id;


--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE role_id_seq OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE role_id_seq OWNED BY arr_role.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY arr_categories ALTER COLUMN id SET DEFAULT nextval('categories_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY arr_menus ALTER COLUMN id SET DEFAULT nextval('menus_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY arr_posts ALTER COLUMN id SET DEFAULT nextval('posts_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY arr_role ALTER COLUMN id SET DEFAULT nextval('role_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY arr_users ALTER COLUMN id SET DEFAULT nextval('arr_users_id_seq'::regclass);


--
-- Data for Name: arr_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY arr_categories (id, parent, level, name, alias, description, published, created_at, created_by, modified_at, modified_by) FROM stdin;
1	-1	0	Root	root	ROOT	1	\N	\N	\N	\N
4	1	1	News	news	\N	1	2015-03-23 08:52:31.337	44	2015-03-23 08:52:31.341	\N
2	1	1	Blog	blog	\N	1	\N	\N	2015-03-24 10:32:13.444	44
5	4	2	Technology	technology	\N	1	2015-03-24 02:44:22.107	44	2015-03-25 04:19:55.553	44
6	4	2	Magazine	magazine	\N	1	2015-03-24 07:57:41.165	44	2015-03-25 04:20:00.1	44
8	2	2	Sub2	sub2	\N	1	2015-03-25 04:19:15.504	44	2015-03-25 07:22:12.527	44
7	2	2	Sub1	sub1	\N	1	2015-03-25 04:04:31.249	44	2015-03-25 07:47:14.552	44
11	1	1	Sub3	sub3	\N	1	2015-04-03 07:53:28.999	44	2015-04-03 07:53:39.655	44
12	1	1	Sub4	sub4	\N	1	2015-04-03 07:53:50.228	44	2015-04-03 07:53:50.228	\N
13	1	1	Sub5	sub5	\N	1	2015-04-03 07:53:56.949	44	2015-04-03 07:53:56.949	\N
\.


--
-- Data for Name: arr_menu_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY arr_menu_detail (id, menu_id, name, attribute, link, parent_id, created_at, created_by, modified_at, modified_by, status) FROM stdin;
1	33	menu1	\N	#	\N	2015-03-04 09:35:33.715	\N	2015-03-04 09:35:33.715	\N	publish
1	112	1111	1111                     		\N	2015-04-04 08:36:44.731	\N	2015-04-04 08:36:44.731	\N	publish
2	112	222	   2322                  		\N	2015-04-04 08:36:44.732	\N	2015-04-04 08:36:44.732	\N	publish
5	112	Sub2	                         	/category/sub2	\N	2015-04-04 08:36:44.734	\N	2015-04-04 08:36:44.734	\N	publish
1	106	2222	\N		\N	2015-04-01 07:28:54.294	\N	2015-04-01 07:28:54.294	\N	publish
2	106		\N	3333	\N	2015-04-01 07:28:54.295	\N	2015-04-01 07:28:54.295	\N	publish
1	107	111	\N	111	\N	2015-04-01 07:29:30.435	\N	2015-04-01 07:29:30.435	\N	publish
2	107	111	\N	111	\N	2015-04-01 07:29:30.436	\N	2015-04-01 07:29:30.436	\N	publish
1	108	22	\N		\N	2015-04-01 07:35:55.129	\N	2015-04-01 07:35:55.128	\N	publish
2	108	222	\N		\N	2015-04-01 07:35:55.131	\N	2015-04-01 07:35:55.131	\N	publish
1	93	111	\N		\N	2015-03-11 07:55:45.531	\N	2015-03-11 07:55:45.531	\N	publish
2	93	222	\N		\N	2015-03-11 07:55:45.532	\N	2015-03-11 07:55:45.532	\N	publish
3	112	333	                         		\N	2015-04-04 08:36:44.735	\N	2015-04-04 08:36:44.735	\N	publish
4	112	Google	                         	http://google.com.vn	\N	2015-04-04 08:36:44.736	\N	2015-04-04 08:36:44.736	\N	publish
6	112	Technology	                         	/category/technology	\N	2015-04-04 08:36:44.737	\N	2015-04-04 08:36:44.737	\N	publish
7	112	Magazine	                         	/category/magazine	\N	2015-04-04 08:36:44.739	\N	2015-04-04 08:36:44.739	\N	publish
1	88	Menu 1	\N	#	\N	2015-03-24 08:18:25.18	\N	2015-03-24 08:18:25.18	\N	publish
2	88	Menu 2	\N	/#	\N	2015-03-24 08:18:25.182	\N	2015-03-24 08:18:25.182	\N	publish
3	88	Menu 3	\N		\N	2015-03-24 08:18:25.183	\N	2015-03-24 08:18:25.183	\N	publish
1	34	Trang Chủ	\N	/	\N	2015-03-28 03:29:14.821	\N	2015-03-28 03:29:14.821	\N	publish
2	34	Khoá học	\N	/posts	\N	2015-03-28 03:29:14.824	\N	2015-03-28 03:29:14.824	\N	publish
1	96	11111	\N		\N	2015-03-11 10:48:23.954	\N	2015-03-11 10:48:23.954	\N	publish
2	96	dsfdsfsdf	\N		\N	2015-03-11 10:48:23.958	\N	2015-03-11 10:48:23.958	\N	publish
1	97	dfssdf	\N		\N	2015-03-11 10:48:55.695	\N	2015-03-11 10:48:55.695	\N	publish
2	97	sdfsdf	\N		\N	2015-03-11 10:48:55.696	\N	2015-03-11 10:48:55.696	\N	publish
3	97	sdfsdf	\N		\N	2015-03-11 10:48:55.697	\N	2015-03-11 10:48:55.697	\N	publish
3	34	Việc làm	\N	/jobs/	\N	2015-03-28 03:29:14.825	\N	2015-03-28 03:29:14.825	\N	publish
4	34	Phỏng vấn	\N	/interviews	\N	2015-03-28 03:29:14.826	\N	2015-03-28 03:29:14.826	\N	publish
5	34	EBOOKS	\N	books	\N	2015-03-28 03:29:14.826	\N	2015-03-28 03:29:14.826	\N	publish
6	34	CHÚNG TÔI	\N	/trungtam	\N	2015-03-28 03:29:14.827	\N	2015-03-28 03:29:14.827	\N	publish
7	34	Khách hàng - đối tác	\N		\N	2015-03-28 03:29:14.827	\N	2015-03-28 03:29:14.827	\N	publish
8	34	Giảng viên	\N		\N	2015-03-28 03:29:14.828	\N	2015-03-28 03:29:14.828	\N	publish
9	34	Thiết bị đào tạo	\N		\N	2015-03-28 03:29:14.828	\N	2015-03-28 03:29:14.828	\N	publish
10	34	Quy Định Chung	\N		\N	2015-03-28 03:29:14.829	\N	2015-03-28 03:29:14.829	\N	publish
11	34	Tuyển dụng giảng viên	\N		\N	2015-03-28 03:29:14.829	\N	2015-03-28 03:29:14.829	\N	publish
1	100	Home	                         	/	\N	2015-04-06 08:47:04.423	\N	2015-04-06 08:47:04.423	\N	publish
2	100	Popular	                         	/popular	\N	2015-04-06 08:47:04.425	\N	2015-04-06 08:47:04.425	\N	publish
3	100	Charts	                         	/charts	\N	2015-04-06 08:47:04.427	\N	2015-04-06 08:47:04.427	\N	publish
4	100	About	                         	/about	\N	2015-04-06 08:47:04.428	\N	2015-04-06 08:47:04.428	\N	publish
3	109	zzz	\N		\N	2015-04-02 02:33:28.45	\N	2015-04-02 02:33:28.45	\N	publish
2	109	yyy	\N		\N	2015-04-02 02:33:28.451	\N	2015-04-02 02:33:28.451	\N	publish
1	109	xxx	\N		\N	2015-04-02 02:33:28.451	\N	2015-04-02 02:33:28.451	\N	publish
1	110	z	\N		\N	2015-04-02 02:34:16.185	\N	2015-04-02 02:34:16.185	\N	publish
3	111	333	\N		\N	2015-04-02 02:58:50.286	\N	2015-04-02 02:58:50.286	\N	publish
1	111	111	\N		\N	2015-04-02 02:58:50.287	\N	2015-04-02 02:58:50.287	\N	publish
2	111	222	\N		\N	2015-04-02 02:58:50.288	\N	2015-04-02 02:58:50.288	\N	publish
1	30	Home	\N	/	\N	2015-04-04 03:12:21.308	\N	2015-04-04 03:12:21.307	\N	publish
2	30	Blog	\N	/category/blog	\N	2015-04-04 03:12:21.308	\N	2015-04-04 03:12:21.308	\N	publish
3	30	About	\N	/about	\N	2015-04-04 03:12:21.309	\N	2015-04-04 03:12:21.309	\N	publish
4	30	Contact	\N	/contact	\N	2015-04-04 03:12:21.31	\N	2015-04-04 03:12:21.31	\N	publish
5	30	News	\N	/category/news	\N	2015-04-04 03:12:21.31	\N	2015-04-04 03:12:21.31	\N	publish
6	30	Tunisia's Bardo Museum to reopen after deadly attack	\N	/tunisias-bardo-museum-to-reopen-after-deadly-attack	\N	2015-04-04 03:12:21.311	\N	2015-04-04 03:12:21.311	\N	publish
7	30	Bee behaviour mapped by tiny trackers	\N	/bee-behaviour-mapped-by-tiny-trackers	\N	2015-04-04 03:12:21.311	\N	2015-04-04 03:12:21.311	\N	publish
8	30	Return to Iwo Jima 70 years on	\N	/return-to-iwo-jima-70-years-on	\N	2015-04-04 03:12:21.311	\N	2015-04-04 03:12:21.311	\N	publish
1	113	111	\N		\N	2015-04-03 03:19:12.975	\N	2015-04-03 03:19:12.975	\N	publish
2	113	222	\N		\N	2015-04-03 03:19:12.977	\N	2015-04-03 03:19:12.977	\N	publish
3	113	333	\N		\N	2015-04-03 03:19:12.978	\N	2015-04-03 03:19:12.978	\N	publish
\.


--
-- Data for Name: arr_menus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY arr_menus (id, name, status, created_at, created_by, modified_at, modified_by, menu_order) FROM stdin;
30	Main Menu	publish	2015-02-24 09:38:14.074	\N	2015-04-04 03:12:21.297	\N	[{"id":"1"},{"id":"2"},{"id":"3"},{"id":"4"},{"id":"5","children":[{"id":"6"},{"id":"7"},{"id":"8"}]}]
34	New Menu	publish	2015-03-05 02:27:59.68	\N	2015-03-28 03:29:14.792	\N	[{"id":"1"},{"id":"2"},{"id":"3"},{"id":"4"},{"id":"5"},{"id":"6","children":[{"id":"7"},{"id":"8"},{"id":"9"},{"id":"10"},{"id":"11"}]}]
112	zzz	publish	2015-04-02 02:59:34.333	\N	2015-04-04 08:36:44.719	\N	[{"id":"1"},{"id":"2","children":[{"id":"5"}]},{"id":"3"},{"id":"4","children":[{"id":"6","children":[{"id":"7"}]}]}]
100	Orama Menu	publish	2015-03-30 08:12:38.731	\N	2015-04-06 08:47:04.402	\N	[{"id":"1"},{"id":"2"},{"id":"3"},{"id":"4"}]
113	xxx	publish	2015-04-02 02:59:57.027	\N	2015-04-03 03:19:12.958	\N	[{"id":"1","children":[{"id":"2","children":[{"id":"3"}]}]}]
\.


--
-- Data for Name: arr_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY arr_posts (id, title, alias, intro_text, full_text, image, tags, hit, published, published_at, cache, categories, type, seo_info, created_at, created_by, modified_at, modified_by) FROM stdin;
7	About	about	FreeSkyTeam is group of ex-Microsoft and Nokia developers who have at least 6 years programming. Development methodology: SCRUM, Agile, Kanban Skills set: Apple iOS, Windows 8, PHP Phalcon, WordPress, Play Framework	FreeSkyTeam is group of ex-Microsoft and Nokia developers who have at least 6 years programming. Development methodology: SCRUM, Agile, Kanban Skills set: Apple iOS, Windows 8, PHP Phalcon, WordPress, Play Framework - Scala, HTML5, JavaScript Professional graphics design service: Adobe Photoshop, Illustrator, After Effect... Our team deliver beta 2 weeks after the bid is accepted. Then every day, employer will receive a new build through TestFlight. We guarantee to commit the deadline. We communicate in English natively.		\N	0	1	\N	\N	\N	page	{"meta_title":"Return to Iwo Jima 70 years on","meta_keyword":"","meta_description":" ... "}	2015-03-24 02:59:46.605	44	2015-03-24 09:47:30.353	44
14	Contact	contact		<h3>Apple iOS lead developer</h3>\r\nTechMaster VietnamNov 2011\r\n\r\n<p>- Design and develop Apple iOS - Windows 8 - Android apps - Professional Apple iOS, Windows 8 trainer - Consult Microsoft technologies for enterprise customers - Invited lecturer in Hanoi University of Technology</p>\r\n		\N	0	1	\N	\N	\N	page	{"meta_title":"Contact","meta_keyword":"","meta_description":"Apple iOS lead developer\\nTechMaster VietnamNov 2011\\n\\n- Design and develop Apple iOS - Windows 8 - Android apps - Professional Apple iOS, Windows 8 trainer - ... "}	2015-03-24 07:54:48.467	44	2015-03-24 09:48:12.24	44
17	Test page	test-page		Test page sdfdsf		\N	0	1	\N	\N	:2:4:6:	page	{"meta_title":"Test page","meta_keyword":"","meta_description":" ... "}	2015-03-25 02:34:03.305	44	2015-03-25 08:25:42.337	44
11	Return to Iwo Jima 70 years on	return-to-iwo-jima-70-years-on		sdafasdf		\N	5	1	2015-04-24 03:26:15.085	\N	:2:4:	post	{"meta_title":"Return to Iwo Jima 70 years on","meta_keywords":"","meta_description":" ... "}	2015-03-24 07:49:24.155	44	2015-04-24 03:26:15.095	1
18	New page	new-page				\N	0	1	\N	\N	\N	page	\N	2015-03-25 08:25:50.109	44	2015-03-26 08:06:31.473	45
5	Tunisia's Bardo Museum to reopen after deadly attack	tunisias-bardo-museum-to-reopen-after-deadly-attack		<p>Tunisia's Bardo Museum is due to reopen less than a week after gunmen killed at least 22 people, mostly European tourists, in the capital Tunis.</p>\r\n\r\n<p>A concert and a public rally are expected, with museum officials saying they want to show the world that the gunmen "haven't achieved their goal".</p>\r\n\r\n<p>There are fears the attack - claimed by Islamic State (IS) - will hit Tunisia's vital tourism industry.</p>\r\n\r\n<p>On Monday, Tunisia's prime minister dismissed six police chiefs.</p>\r\n\r\n<p>Habib Essid's office said he had noted several security deficiencies during a visit to the museum, which houses a major collection of Roman mosaics and other antiquities.</p>\r\n\r\n<div class="media-placeholder narrative-video-placeholder" data-media-meta="{" duration=""> </div>\r\n\r\n<p>Two of the gunmen were killed by the security forces during last Wednesday's attack, while a third is on the run, officials said.</p>\r\n\r\n<p>The attack was the deadliest in Tunisia since the uprising which led to the overthrow of long-serving ruler Zine al-Abidine Ben Ali in 2011.</p>\r\n\r\n<p>Suspects have been arrested over the attack but just two gunmen were thought to have raided the museum.</p>\r\n\r\n<p>They are said to have been trained in Libya in an area controlled by Islamic State (IS) militants.</p>\r\n\r\n<p><a href="http://www.bbc.co.uk/news/world-africa-32011143">Lyse Doucet: Tunisia's test of transition</a></p>\r\n\r\n<p><a href="http://www.bbc.com/news/world-africa-31978874">Cradle of 'Arab Spring' under threat</a></p>\r\n\r\n<h2>Upsurge in extremism</h2>\r\n\r\n<p>The two gunmen seen in footage released by the interior ministry were named as Yassine Laabidi and Hatem Khachnaoui.</p>\r\n\r\n<div class="media-placeholder narrative-video-placeholder" data-media-meta="{" duration=""> </div>\r\n\r\n<p>They were both&nbsp;<a href="http://www.bbc.co.uk/news/world-africa-31966927">killed in a gunfight with security forces inside the building</a>.</p>\r\n\r\n<p>In an interview with&nbsp;<a href="http://www.parismatch.com/Actu/International/Beji-Caid-Essebsi-Tunisia-will-never-be-governed-by-sharia-law-730268">Paris Match</a>, Mr Essebsi said that "shortcomings" in Tunisia's security system meant "the police and intelligence services had not been thorough enough in protecting the museum".</p>\r\n\r\n<p>However, he added that the security services "reacted very efficiently" to the attack and had helped save dozens of lives.</p>\r\n\r\n<p>At least 20 foreigners were among those killed in the attack, including British, Japanese, French, Italian and Colombian tourists.</p>\r\n\r\n<p>Following the attack, large numbers of Tunisians gathered outside the museum to protest against terrorism.</p>\r\n\r\n<p><a href="http://www.bbc.co.uk/news/world-africa-31978874">Tunisia has seen an upsurge in Islamist extremism</a>&nbsp;since the 2011 revolution - the event that sparked the Arab Spring.</p>\r\n\r\n<p>The leader of Tunisia's moderate Islamist party, Ennadha, says the country will continue to be under threat of attack as long as neighbouring Libya remains unstable.</p>\r\n\r\n<p>Rached Ghannouchi told the BBC that IS would not be able to establish a foothold in Tunisia itself but young men were being armed in Libya and crossing borders that were hard to control.</p>\r\n\r\n<p>In recent years Tunisia has been the largest exporter of jihadists in the region, and many of them end up fighting in Syria, reports the BBC's Rana Jawad in Tunis.</p>\r\n	/fileman/Uploads/Images/bpthumb.jpg	\N	14	1	\N	\N	:4:	post	{"meta_title":"Tunisia's Bardo Museum to reopen after deadly attack","meta_keyword":"Tunisia","meta_description":"Tunisia's Bardo Museum is due to reopen less than a week after gunmen killed at least 22 people, mostly European tourists, in the capital Tunis.\\n\\nA concert and ... "}	2015-03-24 02:28:37.201	44	2015-04-15 08:57:29.539	18
3	Ukraine governor Kolomoisky resigns after row	ukraine-governor-kolomoisky-resigns-after-row	<strong>Ukraine's president has accepted a resignation request by Ihor Kolomoisky - the powerful governor of the eastern Dnipropetrovsk region.</strong>	<p>Ukraine's president has accepted a resignation request by Ihor Kolomoisky - the powerful governor of the eastern Dnipropetrovsk region.</p>\r\n\r\n<p>President Petro Poroshenko's office said this happened when Mr Kolomoisky, one of the country's richest men, met the president in the capital Kiev.</p>\r\n\r\n<p>This comes after armed men suspected of links to Mr Kolomoisky briefly occupied the offices of an oil firm in the city.</p>\r\n\r\n<p>It triggered fears of a major showdown between the tycoon and the state.</p>\r\n\r\n<h2>Ultimatum</h2>\r\n\r\n<p>In a statement released early on Wednesday, Mr Poroshenko's office named Valentyn Reznichenko as the new acting governor of the Dnipropetrovsk region.</p>\r\n\r\n<p>It also quoted the president as saying during the talks with Mr Kolomoisky that the region - a centre of heavy industry - should remain "a bastion of Ukraine in the east and protect the peace".</p>\r\n\r\n<p>Mr Kolomoisky - who is estimated to be worth more than $2bn (£1.3bn) - has been widely credited with helping bring order in Dnipropetrovsk and halt the advance of pro-Russian rebels further to the east.</p>\r\n\r\n<p>He is also financing a number of Ukrainian battalions fighting the separatists in the Donetsk and Luhansk region.</p>\r\n\r\n<p>His resignation comes days after armed men suspected of acting on orders from the oligarch briefly seized the headquarters of the Ukrnafta energy company and its subsidiary UkrTransNafta.</p>\r\n\r\n<p>The armed men - whom Mr Kolomoisky said were from a private security firm - left the buildings after an ultimatum was issued by the central government.</p>\r\n\r\n<p>Mr Kolomoisky claimed the armed men had tried to ward off an illegal takeover of Ukrnafta, in which the tycoon has 42% stake. The state owns the rest of the oil and gas giant.</p>\r\n\r\n<p>This happened after Ukraine's parliament had approved amendments to a law on state-owned companies that experts said effectively removed Mr Kolomoisky's control over Ukrnafta.</p>\r\n\r\n<p>There have been fears that the stand-off between Mr Kolomoisky and the government in Kiev could destabilise the Dnipropetrovsk region.</p>\r\n	http://ichef.bbci.co.uk/news/625/media/images/81858000/jpg/_81858126_akikusaandwoodywilliams2.jpg	\N	1	1	\N	\N	:4:	post	{"meta_title":"Ukraine governor Kolomoisky resigns after row","meta_keyword":"","meta_description":"Ukraine's president has accepted a resignation request by Ihor Kolomoisky - the powerful governor of the eastern Dnipropetrovsk region.\\n\\nPresident Petro ... "}	2015-03-24 02:28:31.191	44	2015-04-01 08:06:08.256	44
6	Bee behaviour mapped by tiny trackers	bee-behaviour-mapped-by-tiny-trackers	<strong>A tiny new tracker designed to monitor bee behaviour is being tested by ecologists at Kew Gardens in London.</strong>	<p>A tiny new tracker designed to monitor bee behaviour is being tested by ecologists at Kew Gardens in London.</p>\r\n\r\n<p>It is made from off-the-shelf technology and is based on equipment used to track pallets in warehouses, said its creator Dr Mark O'Neill.</p>\r\n\r\n<p>Readers, used to pick up a signal from the kit, are connected to Raspberry Pi computers, which log the readings.</p>\r\n\r\n<p>The device has a reach of up to 2.5m (8.2ft). Previously used models were restricted to 1cm (0.4in).</p>\r\n\r\n<p>The tracker consists of a standard RFID (radio frequency identification) chip and a specially designed aerial, which Dr O'Neill has created to be thinner and lighter than other models used to track small insects, allowing him to boost the range.</p>\r\n\r\n<p>The engineer, who is technical director at the Newcastle-based tech firm Tumbling Dice, is currently trying to patent the invention.</p>\r\n\r\n<p>"The first stage was to make very raw pre-production tags using components I could easily buy", he said.</p>\r\n\r\n<p>"I want to make optimised aerial components which would be a lot smaller."</p>\r\n\r\n<p>"I've made about 50 so far. I've soldered them all on my desk - it feels like surgery."</p>\r\n\r\n<p>The average "forage time" for a worker bee is around 20 minutes, suggesting they have a forage range of around 1km (0.6 miles) , Dr O'Neill explained.</p>\r\n\r\n<p>The idea is to have readers dotted around a hive and flower patch in order to track the signals as the bees move around freely in the wild.</p>\r\n\r\n<h2>Chilled bees</h2>\r\n\r\n<p>The tiny trackers, which are just 8mm (0.3in) high and 4.8mm (1.9in) wide, are stuck to the bees with superglue in a process which takes five to 10 minutes. The bees are chilled first to make them more docile.</p>\r\n\r\n<p>"They make a hell of a noise," acknowledged Dr O'Neill.</p>\r\n\r\n<p>He told the BBC he hoped that the trackers - which weigh less than a bee and are attached at their centre of gravity so as not to affect their flight - would remain attached for their three-month expected lifespan.</p>\r\n\r\n<p><img alt="bee with tracker" class="js-image-replace" src="http://ichef.bbci.co.uk/news/200/media/images/81862000/jpg/_81862790_bee1.jpg" style="-webkit-user-select:none; border:0px; color:inherit; display:block; font-family:inherit; font-stretch:inherit; font-style:inherit; font-variant:inherit; font-weight:inherit; height:auto; letter-spacing:inherit; line-height:inherit; margin:0px; max-width:100%; padding:0px; vertical-align:baseline; width:616.203125px" /></p>\r\n\r\n<p>The bees are chilled before the trackers are attached.</p>\r\n\r\n<p>They have only been fitted to worker bees, which do not mate.</p>\r\n\r\n<p>"If an animal ate one, I guess it would have a tracker in its stomach," Dr O'Neill said.</p>\r\n\r\n<p>"But the attrition rate for field worker bees is very low. Most die of old age - they are very competent, and good at getting out of the way."</p>\r\n\r\n<p>Dr Sarah Barlow, a restoration ecologist from Kew Gardens, was involved in testing the as-yet unnamed trackers.</p>\r\n\r\n<p>"These tags are a big step forward in radio technology and no one has a decent medium to long range tag yet that is suitable for flying on small insects," she said.</p>\r\n\r\n<p>"This new technology will open up possibilities for scientists to track bees in the landscape.</p>\r\n\r\n<p>"This piece of the puzzle, of bee behaviour, is absolutely vital if we are to understand better why our bees are struggling and how we can reverse their decline."</p>\r\n	http://ichef.bbci.co.uk/news/625/media/images/81858000/jpg/_81858126_akikusaandwoodywilliams2.jpg	\N	25	1	\N	\N	:7:6:5:	post	{"meta_title":"Bee behaviour mapped by tiny trackers","meta_keyword":"","meta_description":"A tiny new tracker designed to monitor bee behaviour is being tested by ecologists at Kew Gardens in London.\\n\\nIt is made from off-the-shelf technology and is ... "}	2015-03-24 02:29:25.353	44	2015-04-22 03:47:38.102	44
13	The incredibly strict diet of a Jain monk	the-incredibly-strict-diet-of-a-jain-monk		monk		\N	0	1	\N	\N	:4:	post	{"meta_title":"The incredibly strict diet of a Jain monk","meta_keyword":"monk","meta_description":" ... "}	2015-03-24 07:49:40.962	44	2015-04-03 08:49:43.073	18
16	The myths about food and pregnancy	the-myths-about-food-and-pregnancy		<div class="pigeon-item__image" style="border: 0px; color: rgb(64, 64, 64); font-family: Helmet, Freesans, Helvetica, Arial, sans-serif; font-stretch: inherit; font-size: 14px; line-height: 16px; margin: 0px 0px 8px; padding: 0px; vertical-align: baseline;">\r\n<div class="responsive-image responsive-image--16by9" style="border: 0px; color: inherit; font-family: inherit; font-style: inherit; font-variant: inherit; font-stretch: inherit; font-weight: inherit; letter-spacing: inherit; line-height: inherit; margin: 0px; padding: 0px 0px 120.9375px; vertical-align: baseline; position: relative; height: 0px; overflow: hidden;"><img alt="binary code in eye" class="js-image-replace" datasrc="http://ichef.bbci.co.uk/news/200/media/images/81847000/jpg/_81847087_154604890.jpg" src="http://ichef.bbci.co.uk/news/235/media/images/81847000/jpg/_81847087_154604890.jpg" style="-webkit-user-select:none; border:0px; color:inherit; display:block; font-family:inherit; font-stretch:inherit; font-style:inherit; font-variant:inherit; font-weight:inherit; height:auto; letter-spacing:inherit; line-height:inherit; margin:0px; max-width:100%; padding:0px; vertical-align:baseline; width:215px" /></div>\r\n</div>\r\n\r\n<div class="pigeon-item__body" style="border: 0px; color: rgb(64, 64, 64); font-family: Helmet, Freesans, Helvetica, Arial, sans-serif; font-stretch: inherit; font-size: 14px; line-height: 16px; margin: 0px; padding: 0px; vertical-align: baseline;">\r\n<h3 style="color:inherit; font-style:inherit"><a href="http://www.bbc.com/news/technology-32019790">Sexism on trial in Silicon Valley</a></h3>\r\n\r\n<p>A judge has ruled that a woman may seek punitive damages from a venture capital firm in Silicon Valley on the grounds of sexual discrimination.</p>\r\n<a href="http://www.bbc.com/news/technology-32019790">Full article Sexism on trial in Silicon Valley</a></div>\r\n		\N	8	1	\N	\N	:2:4:	post	{"meta_title":"The myths about food and pregnancy","meta_keyword":"has a keyword","meta_description":"Sexism on trial in Silicon Valley\\n\\nA judge has ruled that a woman may seek punitive damages from a venture capital firm in Silicon Valley on the grounds of ... "}	2015-03-24 09:36:57.632	44	2015-04-15 08:57:10.832	44
26	test	test		unpub		\N	0	0	\N	\N	\N	post	%7B%22meta_title%22%3A%22test%22%2C%22meta_keywords%22%3A%22%22%2C%22meta_description%22%3A%22%20...%20%22%7D	2015-04-24 03:26:42.663	1	2015-04-24 03:26:42.663	\N
27	test2	test2		publish		\N	0	1	2015-04-24 03:27:02.092	\N	\N	post	%7B%22meta_title%22%3A%22test2%22%2C%22meta_keywords%22%3A%22%22%2C%22meta_description%22%3A%22%20...%20%22%7D	2015-04-24 03:27:02.095	1	2015-04-24 03:27:02.095	\N
\.


--
-- Data for Name: arr_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY arr_role (id, name, rules, created_at, created_by, modified_at, modified_by, status, f_rules) FROM stdin;
2	Admin	{"blog":"category_index:category_create:category_edit:category_delete:post_index:post_create:post_edit:post_delete:page_index:page_create:page_edit:page_delete","configurations":"update_info:change_themes:import_themes:delete_themes","dashboard":"index","menus":"index:create:update:delete","modules":"index:active","plugins":"index:active","roles":"index:create:update:delete","users":"index:create:update:delete","widgets":"index"}	2015-02-04 08:30:22.254	\N	2015-04-13 10:29:03.806	\N	publish	{"course_online":"course_category_index:course_category_create:course_category_update:course_category_delete:course_category_delete_all:lecture_index:lecture_create:lecture_delete:lecture_delete_all"}
\.


--
-- Data for Name: arr_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY arr_users (id, user_login, user_pass, user_email, user_url, user_registered, user_activation_key, display_name, user_image_url, salt, role_id, user_status, reset_password_token, reset_password_expires) FROM stdin;
1	admin	D7DJBzcxoV5ca7mtTm17dZlTkDFouiLkJnOuOmkZ83qpV1GmIhlObDV0IS8KdelMJDg6cBX4+rrBOmnSW6W3Ew==	admin@admin.com		2015-04-07 04:39:11.866209		Administrator	/img/users/admin.png	GCARgHLlYW6MoknWM6WzR5Qi4Xsj4cjVrGZ8JtEPfcbjgyfmhG	2	publish	\N	\N
\.


--
-- Name: arr_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('arr_users_id_seq', 1, true);


--
-- Data for Name: arr_widgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY arr_widgets (id, sidebar, data, created_at, created_by, modified_at, modified_by, widget_type, ordering) FROM stdin;
1426060524712	sidebar2	{"widget":"menus","title":"","menu_id":"30","file":"main_menu.html"}	2015-03-11 07:55:24.717	\N	2015-03-11 10:52:33.006	\N	menus	1
1427253974385	right-sidebar	{"widget":"search-post","title":"","cls":"","placeholder":"Keywords ...","button_name":"Search","file":"default.html","ordering":"1"}	2015-03-25 03:26:14.389	\N	2015-03-25 03:26:14.389	\N	search-post	1
1428463807462	sidebar1	{"widget":"arr_custom_html","title":"abc","cls":"","content":"ROBIN HUY","file":"default.html"}	2015-04-08 03:30:07.472	\N	2015-04-10 03:06:19.624	\N	arr_custom_html	1
1426215686811	main-menu	{"widget":"menus","title":"","cls":"","menu_id":"30","file":"main_menu.html"}	2015-03-13 03:01:26.817	\N	2015-04-04 03:16:46.497	\N	menus	2
1428566851035	sidebar2	{"widget":"arr_categories","title":"","cls":"","file":"default.html","ordering":"1"}	2015-04-09 08:07:31.037	\N	2015-04-09 08:07:31.037	\N	arr_categories	2
1428566844429	main-menu	{"widget":"arr_menus","title":"","cls":"","menu_id":"30","file":"main_menu.html","ordering":"1"}	2015-04-09 08:07:24.437	\N	2015-04-09 08:07:24.437	\N	arr_menus	1
1428566879150	right-sidebar	{"widget":"arr_menus","title":"","cls":"","menu_id":"30","file":"main_menu.html","ordering":"1"}	2015-04-09 08:07:59.155	\N	2015-04-09 08:07:59.155	\N	arr_menus	1
1429765239350	test	{"widget":"arr_facebook_comments","title":"","cls":"","number_of_posts":"","color_scheme":"light","order_by":"social","file":"default.html","ordering":"2"}	2015-04-23 05:00:39.354	\N	2015-04-23 05:00:39.354	\N	arr_facebook_comments	1
1429765122231	test	{"widget":"arr_facebook_share","title":"","cls":"","layout_type":"box_count","file":"default.html","ordering":"2"}	2015-04-23 04:58:42.238	\N	2015-04-23 04:58:42.238	\N	arr_facebook_share	2
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('categories_id_seq', 13, true);


--
-- Name: menu_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('menu_detail_id_seq', 1, false);


--
-- Name: menus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('menus_id_seq', 113, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('posts_id_seq', 27, true);


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('role_id_seq', 24, true);


--
-- Name: arr_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_users
    ADD CONSTRAINT arr_users_pkey PRIMARY KEY (id);


--
-- Name: categories_alias_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_categories
    ADD CONSTRAINT categories_alias_key UNIQUE (alias);


--
-- Name: categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: menu_detail_pk; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_menu_detail
    ADD CONSTRAINT menu_detail_pk PRIMARY KEY (id, menu_id);


--
-- Name: menus_pk; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_menus
    ADD CONSTRAINT menus_pk PRIMARY KEY (id);


--
-- Name: posts_alias_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_posts
    ADD CONSTRAINT posts_alias_key UNIQUE (alias);


--
-- Name: posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: role_pk; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_role
    ADD CONSTRAINT role_pk PRIMARY KEY (id);


--
-- Name: users_user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_users
    ADD CONSTRAINT users_user_email_key UNIQUE (user_email);


--
-- Name: widgets_pk; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY arr_widgets
    ADD CONSTRAINT widgets_pk PRIMARY KEY (id);


--
-- Name: users_roles_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY arr_users
    ADD CONSTRAINT users_roles_fkey FOREIGN KEY (role_id) REFERENCES arr_role(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

