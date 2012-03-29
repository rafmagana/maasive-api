set :user, 'deploy'
# set :password, "p0rtland10"
set :deploy_to, "/srv/www/api.maasiveapi.com"
set :use_sudo, false

set :repository, "git@github-api:elc/MaaSiveAPI.git"

server 'maas-web01.elctech.net', :app, :web, :primary => true
server 'maas-web02.elctech.net', :app, :web
#server 'maas-web03.elctech.net', :app, :web
#server 'maas-web04.elctech.net', :app, :web
