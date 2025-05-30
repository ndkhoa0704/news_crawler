CREATE TABLE public.articles (
	id serial4 NOT NULL,
	title text NOT NULL,
	summary text NULL,
	"content" text NULL,
	author varchar(255) NULL,
	published_at timestamp NULL,
	url text NOT NULL,
	source varchar(15) NOT NULL,
	sentiment char(1) NULL,
	CONSTRAINT articles_pkey PRIMARY KEY (id)
);