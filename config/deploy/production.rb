set :deploy_to, "#{app_parent_path}/api.your_maasive_domain.com"

server 'your_server_01', :app, :web, :primary => true
server 'your_server_02', :app, :web
server 'your_server_03', :app, :web
server 'your_server_04', :app, :web
